<?php

namespace App\Http\Controllers;

use App\Models\PaymentAttempt;
use App\Models\PaymentRequest;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    /**
     * Buat payment request (tagihan ke user lain).
     * POST /api/payments/request
     */
    public function createRequest(Request $request)
    {
        $validated = $request->validate([
            'to_ipay_id'  => 'required|string',
            'amount'      => 'required|numeric|min:1000|max:50000000',
            'description' => 'nullable|string|max:255',
            'notes'       => 'nullable|string|max:500',
            'expires_in'  => 'nullable|integer|min:1|max:72', // jam
        ]);

        $requester = $request->user();

        // Cari payer
        $payer = User::where('ipay_id', $validated['to_ipay_id'])
            ->where('is_active', true)
            ->first();

        if (!$payer) {
            return response()->json(['message' => 'iPay ID tidak ditemukan.'], 404);
        }

        if ($payer->id === $requester->id) {
            return response()->json(['message' => 'Tidak bisa request ke diri sendiri.'], 422);
        }

        $expiresAt = now()->addHours($validated['expires_in'] ?? 24);

        DB::beginTransaction();
        try {
            $txnCode = Transaction::generateCode();
            $paymentCode = Transaction::generatePaymentCode();

            // 1. Buat pending transaction
            $transaction = Transaction::create([
                'transaction_code' => $txnCode,
                'type'             => 'payment',
                'sender_id'        => $payer->id,
                'receiver_id'      => $requester->id,
                'amount'           => $validated['amount'],
                'description'      => $validated['description'] ?? 'Pembayaran tagihan',
                'status'           => 'pending',
                'otp_code'         => $paymentCode, // digunakan sebagai payment_code
                'expires_at'       => $expiresAt,
            ]);

            // 2. Buat payment request pending
            $paymentRequest = PaymentRequest::create([
                'requester_id'   => $requester->id,
                'payer_id'       => $payer->id,
                'amount'         => $validated['amount'],
                'description'    => $validated['description'] ?? null,
                'notes'          => $validated['notes'] ?? null,
                'status'         => 'pending',
                'transaction_id' => $transaction->id,
                'expires_at'     => $expiresAt,
            ]);

            DB::commit();

            return response()->json([
                'message'      => 'Payment request berhasil dibuat.',
                'payment_code' => $paymentCode,
                'data'         => $paymentRequest->load([
                    'requester:id,name,ipay_id',
                    'payer:id,name,ipay_id',
                    'transaction'
                ]),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal membuat tagihan: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Daftar payment request yang diterima (harus dibayar).
     * GET /api/payments/incoming
     */
    public function incoming(Request $request)
    {
        $requests = $request->user()
            ->paymentRequestsReceived()
            ->with(['requester:id,name,ipay_id,phone', 'transaction'])
            ->when($request->filled('status'), fn($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate(15);

        return response()->json($requests);
    }

    /**
     * Daftar payment request yang dibuat (sudah dikirim).
     * GET /api/payments/outgoing
     */
    public function outgoing(Request $request)
    {
        $requests = $request->user()
            ->paymentRequestsSent()
            ->with(['payer:id,name,ipay_id,phone', 'transaction'])
            ->when($request->filled('status'), fn($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate(15);

        return response()->json($requests);
    }

    /**
     * Bayar payment request (Dari HP pembeli sendiri).
     * POST /api/payments/{id}/pay
     */
    public function pay(Request $request, int $id)
    {
        $validated = $request->validate([
            'pin'              => 'required|string',
            'source'           => 'required|in:ipay,dana,gopay,bca',
            'simulated_status' => 'nullable|in:success,failed',
        ]);

        $payer = $request->user();

        // 1. Verifikasi PIN
        if (!$payer->verifyPin($validated['pin'])) {
            return response()->json(['message' => 'PIN salah.'], 422);
        }

        $paymentRequest = PaymentRequest::where('id', $id)
            ->where('payer_id', $payer->id)
            ->firstOrFail();

        // 2. Proses pembayaran dengan logic terpusat
        return $this->processPayment(
            $paymentRequest,
            $payer,
            $validated['source'],
            $validated['simulated_status'] ?? 'success'
        );
    }

    /**
     * Bayar langsung tanpa HP pembeli (Di HP penjual).
     * POST /api/payments/pay-direct
     */
    public function payDirect(Request $request)
    {
        $validated = $request->validate([
            'payment_code'     => 'nullable|string',
            'amount'           => 'nullable|numeric|min:1000|max:50000000',
            'payer_ipay_id'    => 'required|string',
            'pin'              => 'required|string',
            'source'           => 'required|in:ipay,dana,gopay,bca',
            'simulated_status' => 'nullable|in:success,failed',
            'description'      => 'nullable|string|max:255',
        ]);

        $requester = $request->user();

        // 1. Cari Payer berdasarkan ipay_id
        $payer = User::where('ipay_id', strtoupper($validated['payer_ipay_id']))
            ->where('is_active', true)
            ->first();

        if (!$payer) {
            return response()->json(['message' => 'iPay ID pembeli tidak ditemukan atau tidak aktif.'], 404);
        }

        if ($payer->id === $requester->id) {
            return response()->json(['message' => 'Tidak bisa melakukan transaksi Pay Direct ke diri sendiri.'], 422);
        }

        // 2. Jika diberikan payment_code -> ambil transaksi yang ada
        if (!empty($validated['payment_code'])) {
            $transaction = Transaction::where('otp_code', $validated['payment_code'])
                ->where('status', 'pending')
                ->first();

            if (!$transaction) {
                return response()->json(['message' => 'Kode pembayaran tidak valid, kedaluwarsa, atau transaksi sudah selesai.'], 404);
            }

            if ($transaction->isExpired()) {
                DB::beginTransaction();
                $transaction->update(['status' => 'expired']);
                $paymentRequest = PaymentRequest::where('transaction_id', $transaction->id)->first();
                if ($paymentRequest) {
                    $paymentRequest->update(['status' => 'expired']);
                }
                DB::commit();
                return response()->json(['message' => 'Kode pembayaran sudah kedaluwarsa.'], 422);
            }

            if ($transaction->sender_id !== $payer->id) {
                return response()->json(['message' => 'iPay ID pembeli tidak cocok dengan tagihan ini.'], 422);
            }

            $paymentRequest = PaymentRequest::where('transaction_id', $transaction->id)->firstOrFail();
        } else {
            // Mode Instant Pay Direct: tanpa kode tagihan, cukup masukkan nominal langsung
            if (empty($validated['amount']) || $validated['amount'] < 1000) {
                return response()->json(['message' => 'Nominal pembayaran minimal Rp 1.000 atau masukkan kode pembayaran.'], 422);
            }

            DB::beginTransaction();
            try {
                $txnCode = Transaction::generateCode();
                $paymentCode = Transaction::generatePaymentCode();
                $expiresAt = now()->addHours(24);

                $transaction = Transaction::create([
                    'transaction_code' => $txnCode,
                    'type'             => 'payment',
                    'sender_id'        => $payer->id,
                    'receiver_id'      => $requester->id,
                    'amount'           => $validated['amount'],
                    'description'      => $validated['description'] ?? 'Pay Direct di Toko/Penjual',
                    'status'           => 'pending',
                    'otp_code'         => $paymentCode,
                    'expires_at'       => $expiresAt,
                ]);

                $paymentRequest = PaymentRequest::create([
                    'requester_id'   => $requester->id,
                    'payer_id'       => $payer->id,
                    'amount'         => $validated['amount'],
                    'description'    => $validated['description'] ?? 'Pay Direct di Toko/Penjual',
                    'notes'          => 'Transaksi langsung di perangkat penjual',
                    'status'         => 'pending',
                    'transaction_id' => $transaction->id,
                    'expires_at'     => $expiresAt,
                ]);

                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                return response()->json(['message' => 'Gagal menginisialisasi transaksi: ' . $e->getMessage()], 500);
            }
        }

        // 3. Verifikasi PIN Pembeli
        if (!$payer->verifyPin($validated['pin'])) {
            PaymentAttempt::create([
                'transaction_id'       => $transaction->id,
                'payment_source_label' => $validated['source'],
                'status'               => 'failed',
                'failure_reason'       => 'PIN pembeli salah',
            ]);
            return response()->json(['message' => 'PIN pembeli salah.'], 422);
        }

        // 4. Proses pembayaran
        return $this->processPayment(
            $paymentRequest,
            $payer,
            $validated['source'],
            $validated['simulated_status'] ?? 'success'
        );
    }

    /**
     * Logic pembayaran terpusat untuk menjaga konsistensi.
     */
    private function processPayment(PaymentRequest $paymentRequest, User $payer, string $source, string $simulatedStatus)
    {
        $transaction = $paymentRequest->transaction;

        // Cek apakah transaksi sudah tidak pending (sudah success, failed, atau expired)
        if ($transaction->status !== 'pending') {
            return response()->json(['message' => 'Transaksi sudah tidak aktif atau sudah diproses sebelumnya.'], 422);
        }

        if ($transaction->isExpired()) {
            DB::beginTransaction();
            $transaction->update(['status' => 'expired']);
            $paymentRequest->update(['status' => 'expired']);
            DB::commit();
            return response()->json(['message' => 'Transaksi sudah kedaluwarsa.'], 422);
        }

        $requester = $paymentRequest->requester;

        // ──── SOURCE: IPAY (Mengurangi Saldo iPay Pembeli) ────
        if ($source === 'ipay') {
            if (!$payer->hasSufficientBalance($paymentRequest->amount)) {
                // Catat attempt gagal
                PaymentAttempt::create([
                    'transaction_id'       => $transaction->id,
                    'payment_source_label' => 'ipay',
                    'status'               => 'failed',
                    'failure_reason'       => 'Saldo iPay tidak mencukupi',
                ]);
                return response()->json(['message' => 'Saldo iPay tidak mencukupi.'], 422);
            }

            DB::beginTransaction();
            try {
                // Lock data user untuk menghindari race condition saldo
                $lockedUsers = User::whereIn('id', [$payer->id, $requester->id])
                    ->lockForUpdate()
                    ->get();

                $lockedPayer = $lockedUsers->firstWhere('id', $payer->id);
                $lockedRequester = $lockedUsers->firstWhere('id', $requester->id);

                if ($lockedPayer->balance < $paymentRequest->amount) {
                    throw new \Exception('Saldo mendadak tidak mencukupi.');
                }

                // Kurangi saldo payer
                $lockedPayer->decrement('balance', $paymentRequest->amount);
                // Tambah saldo requester
                $lockedRequester->increment('balance', $paymentRequest->amount);

                // Update status transaksi ke success
                $transaction->update([
                    'status'       => 'success',
                    'completed_at' => now(),
                ]);

                // Update status payment request ke accepted
                $paymentRequest->update([
                    'status' => 'accepted',
                ]);

                // Catat attempt sukses
                PaymentAttempt::create([
                    'transaction_id'       => $transaction->id,
                    'payment_source_label' => 'ipay',
                    'status'               => 'success',
                ]);

                DB::commit();

                return response()->json([
                    'message'          => 'Pembayaran berhasil menggunakan Saldo iPay.',
                    'transaction_code' => $transaction->transaction_code,
                    'amount'           => (float) $paymentRequest->amount,
                    'paid_to'          => $requester->name,
                    'new_balance'      => (float) $payer->fresh()->balance,
                ]);

            } catch (\Exception $e) {
                DB::rollBack();
                return response()->json(['message' => 'Pembayaran gagal diproses: ' . $e->getMessage()], 500);
            }
        }

        // ──── SOURCE: DANA / GOPAY / BCA (SIMULASI) ────
        else {
            if ($simulatedStatus === 'success') {
                DB::beginTransaction();
                try {
                    // Lock penerima
                    $lockedRequester = User::where('id', $requester->id)
                        ->lockForUpdate()
                        ->first();

                    // Saldo Payer TIDAK berkurang.
                    // Saldo Requester (Penjual) tetap bertambah karena simulasi dana eksternal masuk.
                    $lockedRequester->increment('balance', $paymentRequest->amount);

                    // Update status transaksi ke success
                    $transaction->update([
                        'status'       => 'success',
                        'completed_at' => now(),
                    ]);

                    // Update status payment request
                    $paymentRequest->update([
                        'status' => 'accepted',
                    ]);

                    // Catat attempt sukses
                    PaymentAttempt::create([
                        'transaction_id'       => $transaction->id,
                        'payment_source_label' => $source,
                        'status'               => 'success',
                    ]);

                    DB::commit();

                    return response()->json([
                        'message'          => 'Pembayaran berhasil (Simulasi ' . strtoupper($source) . ').',
                        'transaction_code' => $transaction->transaction_code,
                        'amount'           => (float) $paymentRequest->amount,
                        'paid_to'          => $requester->name,
                        'new_balance'      => (float) $payer->fresh()->balance, // Tetap utuh
                    ]);

                } catch (\Exception $e) {
                    DB::rollBack();
                    return response()->json(['message' => 'Gagal memproses simulasi: ' . $e->getMessage()], 500);
                }
            } else {
                // Catat attempt gagal (transaksi utama tetap pending)
                PaymentAttempt::create([
                    'transaction_id'       => $transaction->id,
                    'payment_source_label' => $source,
                    'status'               => 'failed',
                    'failure_reason'       => 'Simulasi transaksi gagal dari penyedia eksternal',
                ]);

                return response()->json([
                    'message'          => 'Simulasi pembayaran ' . strtoupper($source) . ' gagal.',
                    'transaction_code' => $transaction->transaction_code,
                    'status'           => 'pending', // Masih pending sehingga bisa dicoba lagi
                ], 422);
            }
        }
    }

    /**
     * Tolak payment request.
     * POST /api/payments/{id}/reject
     */
    public function reject(Request $request, int $id)
    {
        $paymentRequest = PaymentRequest::where('id', $id)
            ->where('payer_id', $request->user()->id)
            ->firstOrFail();

        $transaction = $paymentRequest->transaction;

        if (!$paymentRequest->isPending() || ($transaction && $transaction->status !== 'pending')) {
            return response()->json(['message' => 'Payment request sudah tidak aktif.'], 422);
        }

        DB::beginTransaction();
        $paymentRequest->update(['status' => 'rejected']);
        if ($transaction) {
            $transaction->update(['status' => 'failed']);
        }
        DB::commit();

        return response()->json(['message' => 'Payment request ditolak.']);
    }

    /**
     * Cancel payment request yang sudah dibuat.
     * POST /api/payments/{id}/cancel
     */
    public function cancel(Request $request, int $id)
    {
        $paymentRequest = PaymentRequest::where('id', $id)
            ->where('requester_id', $request->user()->id)
            ->firstOrFail();

        $transaction = $paymentRequest->transaction;

        if (!$paymentRequest->isPending() || ($transaction && $transaction->status !== 'pending')) {
            return response()->json(['message' => 'Payment request sudah tidak aktif.'], 422);
        }

        DB::beginTransaction();
        $paymentRequest->update(['status' => 'cancelled']);
        if ($transaction) {
            $transaction->update(['status' => 'cancelled']);
        }
        DB::commit();

        return response()->json(['message' => 'Payment request dibatalkan.']);
    }

    /**
     * Detail payment request.
     * GET /api/payments/{id}
     */
    public function show(Request $request, int $id)
    {
        $user = $request->user();

        $paymentRequest = PaymentRequest::where('id', $id)
            ->where(function ($q) use ($user) {
                $q->where('requester_id', $user->id)
                  ->orWhere('payer_id', $user->id);
            })
            ->with(['requester:id,name,ipay_id', 'payer:id,name,ipay_id', 'transaction'])
            ->firstOrFail();

        return response()->json(['data' => $paymentRequest]);
    }
}
