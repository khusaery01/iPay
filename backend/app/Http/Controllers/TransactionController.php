<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    /**
     * Riwayat transaksi (masuk + keluar).
     * GET /api/transactions
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Transaction::where(function ($q) use ($user) {
            $q->where('sender_id', $user->id)
              ->orWhere('receiver_id', $user->id);
        })->with(['sender:id,name,ipay_id', 'receiver:id,name,ipay_id']);

        // Filter by type
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $transactions = $query->latest()->paginate(20);

        // Tambahkan label direction (masuk/keluar)
        $transactions->getCollection()->transform(function ($txn) use ($user) {
            $txn->direction = $txn->receiver_id === $user->id ? 'in' : 'out';
            return $txn;
        });

        return response()->json($transactions);
    }

    /**
     * Detail satu transaksi.
     * GET /api/transactions/{code}
     */
    public function show(Request $request, string $code)
    {
        $user = $request->user();

        $transaction = Transaction::where('transaction_code', $code)
            ->where(function ($q) use ($user) {
                $q->where('sender_id', $user->id)
                  ->orWhere('receiver_id', $user->id);
            })
            ->with(['sender:id,name,ipay_id,phone', 'receiver:id,name,ipay_id,phone', 'paymentMethod'])
            ->firstOrFail();

        $transaction->direction = $transaction->receiver_id === $user->id ? 'in' : 'out';

        return response()->json(['data' => $transaction]);
    }

    /**
     * Transfer saldo ke user lain.
     * POST /api/transactions/transfer
     */
    public function transfer(Request $request)
    {
        $validated = $request->validate([
            'to_ipay_id'  => 'required|string',  // iPay ID penerima
            'amount'      => 'required|numeric|min:1000|max:50000000',
            'description' => 'nullable|string|max:255',
            'pin'         => 'required|string',
        ]);

        $sender = $request->user();

        // Verifikasi PIN
        if (!$sender->verifyPin($validated['pin'])) {
            return response()->json(['message' => 'PIN salah.'], 422);
        }

        // Cari penerima
        $receiver = User::where('ipay_id', $validated['to_ipay_id'])
            ->where('is_active', true)
            ->first();

        if (!$receiver) {
            return response()->json(['message' => 'iPay ID penerima tidak ditemukan.'], 404);
        }

        if ($receiver->id === $sender->id) {
            return response()->json(['message' => 'Tidak bisa transfer ke diri sendiri.'], 422);
        }

        if (!$sender->hasSufficientBalance($validated['amount'])) {
            return response()->json(['message' => 'Saldo tidak mencukupi.'], 422);
        }

        DB::beginTransaction();
        try {
            // Kurangi saldo pengirim
            $sender->decrement('balance', $validated['amount']);

            // Tambah saldo penerima
            $receiver->increment('balance', $validated['amount']);

            // Buat transaksi
            $transaction = Transaction::create([
                'transaction_code' => Transaction::generateCode(),
                'type'             => 'transfer',
                'sender_id'        => $sender->id,
                'receiver_id'      => $receiver->id,
                'amount'           => $validated['amount'],
                'description'      => $validated['description'] ?? 'Transfer',
                'status'           => 'success',
                'completed_at'     => now(),
            ]);

            DB::commit();

            return response()->json([
                'message'          => 'Transfer berhasil.',
                'transaction_code' => $transaction->transaction_code,
                'to'               => [
                    'name'     => $receiver->name,
                    'ipay_id'  => $receiver->ipay_id,
                ],
                'amount'      => (float) $validated['amount'],
                'new_balance' => (float) $sender->fresh()->balance,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Transfer gagal. Silakan coba lagi.'], 500);
        }
    }

    /**
     * Cek iPay ID (untuk UI konfirmasi sebelum transfer).
     * GET /api/transactions/check-user/{ipay_id}
     */
    public function checkUser(Request $request, string $ipayId)
    {
        $user = User::where('ipay_id', $ipayId)
            ->where('is_active', true)
            ->select('id', 'name', 'ipay_id', 'phone')
            ->first();

        if (!$user) {
            return response()->json(['message' => 'User tidak ditemukan.'], 404);
        }

        // Sembunyikan nomor HP kecuali 4 digit terakhir
        if ($user->phone) {
            $user->phone = '****' . substr($user->phone, -4);
        }

        return response()->json(['data' => $user]);
    }
}
