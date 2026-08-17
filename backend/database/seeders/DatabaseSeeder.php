<?php

namespace Database\Seeders;

use App\Models\PaymentMethod;
use App\Models\PaymentRequest;
use App\Models\TopUp;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ─── 3 Dummy Users ───────────────────────────────────────────────────
        $yanuar = User::create([
            'name'     => 'Yanuar Pratama',
            'email'    => 'yanuar@ipay.test',
            'phone'    => '081234567890',
            'ipay_id'  => 'IPY0000001',
            'pin_hash' => Hash::make('123456'),
            'balance'  => 500000,
        ]);

        $budi = User::create([
            'name'     => 'Budi Santoso',
            'email'    => 'budi@ipay.test',
            'phone'    => '082345678901',
            'ipay_id'  => 'IPY0000002',
            'pin_hash' => Hash::make('123456'),
            'balance'  => 250000,
        ]);

        $citra = User::create([
            'name'     => 'Citra Dewi',
            'email'    => 'citra@ipay.test',
            'phone'    => '083456789012',
            'ipay_id'  => 'IPY0000003',
            'pin_hash' => Hash::make('123456'),
            'balance'  => 1000000,
        ]);

        // ─── Payment Methods ─────────────────────────────────────────────────
        $yanuarGopay = PaymentMethod::create([
            'user_id'    => $yanuar->id,
            'type'       => 'ewallet',
            'provider'   => 'GoPay',
            'identifier' => '081234567890',
            'is_active'  => true,
        ]);

        PaymentMethod::create([
            'user_id'    => $yanuar->id,
            'type'       => 'bank',
            'provider'   => 'BCA',
            'identifier' => '1234567890',
            'is_active'  => true,
        ]);

        $budiDana = PaymentMethod::create([
            'user_id'    => $budi->id,
            'type'       => 'ewallet',
            'provider'   => 'DANA',
            'identifier' => '082345678901',
            'is_active'  => true,
        ]);

        // ─── Sample Top Up (Yanuar) ──────────────────────────────────────────
        $topUpTxn = Transaction::create([
            'transaction_code'  => 'TXN001TOPUP01',
            'type'              => 'topup',
            'receiver_id'       => $yanuar->id,
            'amount'            => 500000,
            'payment_method_id' => $yanuarGopay->id,
            'description'       => 'Top Up via GoPay',
            'status'            => 'success',
            'completed_at'      => now()->subDays(5),
        ]);

        TopUp::create([
            'user_id'           => $yanuar->id,
            'amount'            => 500000,
            'payment_method_id' => $yanuarGopay->id,
            'status'            => 'success',
            'transaction_id'    => $topUpTxn->id,
        ]);

        // ─── Sample Transfer (Yanuar → Budi) ─────────────────────────────────
        Transaction::create([
            'transaction_code' => 'TXN002TRANS01',
            'type'             => 'transfer',
            'sender_id'        => $yanuar->id,
            'receiver_id'      => $budi->id,
            'amount'           => 100000,
            'description'      => 'Transfer buat makan siang',
            'status'           => 'success',
            'completed_at'     => now()->subDays(3),
        ]);

        // ─── Sample Transfer (Citra → Yanuar) ────────────────────────────────
        Transaction::create([
            'transaction_code' => 'TXN003TRANS02',
            'type'             => 'transfer',
            'sender_id'        => $citra->id,
            'receiver_id'      => $yanuar->id,
            'amount'           => 50000,
            'description'      => 'Bayar parkir',
            'status'           => 'success',
            'completed_at'     => now()->subDays(1),
        ]);

        // ─── Sample Payment Request (Budi minta ke Yanuar) ──────────────────
        PaymentRequest::create([
            'requester_id' => $budi->id,
            'payer_id'     => $yanuar->id,
            'amount'       => 75000,
            'description'  => 'Patungan kopi',
            'notes'        => 'Kemarin beli kopi bareng',
            'status'       => 'pending',
            'expires_at'   => now()->addDays(2),
        ]);

        // ─── Sample Payment Request (Citra minta ke Budi) ────────────────────
        PaymentRequest::create([
            'requester_id' => $citra->id,
            'payer_id'     => $budi->id,
            'amount'       => 150000,
            'description'  => 'Tagihan listrik',
            'status'       => 'pending',
            'expires_at'   => now()->addDays(1),
        ]);

        $this->command->info('✅ Seeder selesai! Data dummy berhasil dibuat.');
        $this->command->table(
            ['Nama', 'Email', 'iPay ID', 'PIN', 'Saldo'],
            [
                [$yanuar->name, $yanuar->email, $yanuar->ipay_id, '123456', 'Rp 500.000'],
                [$budi->name,   $budi->email,   $budi->ipay_id,   '123456', 'Rp 250.000'],
                [$citra->name,  $citra->email,  $citra->ipay_id,  '123456', 'Rp 1.000.000'],
            ]
        );
    }
}
