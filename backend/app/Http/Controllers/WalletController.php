<?php

namespace App\Http\Controllers;

use App\Models\PaymentMethod;
use App\Models\TopUp;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WalletController extends Controller
{
    /**
     * Cek saldo + info wallet.
     * GET /api/wallet
     */
    public function balance(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'ipay_id' => $user->ipay_id,
            'name'    => $user->name,
            'balance' => (float) $user->balance,
        ]);
    }

    /**
     * Daftar metode pembayaran user.
     * GET /api/wallet/methods
     */
    public function paymentMethods(Request $request)
    {
        $methods = $request->user()
            ->paymentMethods()
            ->where('is_active', true)
            ->get();

        return response()->json(['data' => $methods]);
    }

    /**
     * Tambah metode pembayaran.
     * POST /api/wallet/methods
     */
    public function addPaymentMethod(Request $request)
    {
        $validated = $request->validate([
            'type'       => 'required|in:ewallet,bank,ipay',
            'provider'   => 'required|string|max:50',
            'identifier' => 'nullable|string|max:50',
        ]);

        $method = $request->user()->paymentMethods()->create($validated);

        return response()->json([
            'message' => 'Metode pembayaran berhasil ditambahkan.',
            'data'    => $method,
        ], 201);
    }

    /**
     * Hapus metode pembayaran (soft delete — set is_active = false).
     * DELETE /api/wallet/methods/{id}
     */
    public function deletePaymentMethod(Request $request, int $id)
    {
        $method = $request->user()->paymentMethods()->findOrFail($id);
        $method->update(['is_active' => false]);

        return response()->json(['message' => 'Metode pembayaran dihapus.']);
    }

    /**
     * Top Up saldo iPay.
     * POST /api/wallet/topup
     */
    public function topUp(Request $request)
    {
        $validated = $request->validate([
            'amount'            => 'required|numeric|min:10000|max:10000000',
            'payment_method_id' => 'nullable|exists:payment_methods,id',
        ]);

        $user = $request->user();

        // Jika pakai payment method, pastikan milik user
        if (!empty($validated['payment_method_id'])) {
            $method = $user->paymentMethods()
                ->where('id', $validated['payment_method_id'])
                ->where('is_active', true)
                ->first();

            if (!$method) {
                return response()->json(['message' => 'Metode pembayaran tidak valid.'], 422);
            }
        }

        DB::beginTransaction();
        try {
            // Buat record transaksi
            $transaction = Transaction::create([
                'transaction_code'  => Transaction::generateCode(),
                'type'              => 'topup',
                'receiver_id'       => $user->id,
                'amount'            => $validated['amount'],
                'payment_method_id' => $validated['payment_method_id'] ?? null,
                'description'       => 'Top Up iPay',
                'status'            => 'success',
                'completed_at'      => now(),
            ]);

            // Buat record top up
            $topUp = TopUp::create([
                'user_id'           => $user->id,
                'amount'            => $validated['amount'],
                'payment_method_id' => $validated['payment_method_id'] ?? null,
                'status'            => 'success',
                'transaction_id'    => $transaction->id,
            ]);

            // Update saldo
            $user->increment('balance', $validated['amount']);

            DB::commit();

            return response()->json([
                'message'          => 'Top Up berhasil.',
                'transaction_code' => $transaction->transaction_code,
                'amount'           => (float) $validated['amount'],
                'new_balance'      => (float) $user->fresh()->balance,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Top Up gagal. Silakan coba lagi.'], 500);
        }
    }

    /**
     * Riwayat top up.
     * GET /api/wallet/topup/history
     */
    public function topUpHistory(Request $request)
    {
        $history = $request->user()
            ->topUps()
            ->with('paymentMethod')
            ->latest()
            ->paginate(15);

        return response()->json($history);
    }
}
