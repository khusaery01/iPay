<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_code', 20)->unique();
            $table->enum('type', ['payment', 'transfer', 'topup', 'request_payment']);
            $table->foreignId('sender_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('receiver_id')->nullable()->constrained('users')->onDelete('set null');
            $table->decimal('amount', 15, 2);
            $table->foreignId('payment_method_id')->nullable()->constrained('payment_methods')->onDelete('set null');
            $table->string('description')->nullable();
            $table->enum('status', ['pending', 'success', 'failed', 'cancelled', 'expired', 'used'])
                ->default('pending');
            $table->string('otp_code', 10)->nullable(); // 6-digit kode transaksi untuk flow tanpa HP
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['sender_id', 'status']);
            $table->index(['receiver_id', 'status']);
            $table->index(['otp_code', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
