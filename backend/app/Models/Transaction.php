<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $fillable = [
        'transaction_code',
        'type',
        'sender_id',
        'receiver_id',
        'amount',
        'payment_method_id',
        'description',
        'status',
        'otp_code',
        'expires_at',
        'completed_at',
    ];

    protected $casts = [
        'amount'       => 'decimal:2',
        'expires_at'   => 'datetime',
        'completed_at' => 'datetime',
    ];

    // ─── Relationships ───────────────────────────────────────────────

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    public function paymentMethod()
    {
        return $this->belongsTo(PaymentMethod::class);
    }

    public function paymentRequest()
    {
        return $this->hasOne(PaymentRequest::class);
    }

    public function topUp()
    {
        return $this->hasOne(TopUp::class);
    }

    public function paymentAttempts()
    {
        return $this->hasMany(PaymentAttempt::class);
    }

    // ─── Helpers ─────────────────────────────────────────────────────

    public static function generateCode(): string
    {
        do {
            $code = 'TXN' . strtoupper(substr(uniqid(), -8)) . rand(10, 99);
        } while (self::where('transaction_code', $code)->exists());

        return $code;
    }

    public static function generatePaymentCode(): string
    {
        do {
            // Generate 6-digit numeric code
            $code = strval(rand(100000, 999999));
        } while (self::where('otp_code', $code)->where('status', 'pending')->exists());

        return $code;
    }

    public function isExpired(): bool
    {
        return $this->expires_at && now()->gt($this->expires_at);
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }
}
