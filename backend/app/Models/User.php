<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'ipay_id',
        'pin_hash',
        'balance',
        'is_active',
        'password',
    ];

    protected $hidden = [
        'pin_hash',
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'balance'           => 'decimal:2',
            'is_active'         => 'boolean',
        ];
    }

    // ─── Relationships ───────────────────────────────────────────────

    public function paymentMethods()
    {
        return $this->hasMany(PaymentMethod::class);
    }

    public function sentTransactions()
    {
        return $this->hasMany(Transaction::class, 'sender_id');
    }

    public function receivedTransactions()
    {
        return $this->hasMany(Transaction::class, 'receiver_id');
    }

    public function topUps()
    {
        return $this->hasMany(TopUp::class);
    }

    public function paymentRequestsSent()
    {
        return $this->hasMany(PaymentRequest::class, 'requester_id');
    }

    public function paymentRequestsReceived()
    {
        return $this->hasMany(PaymentRequest::class, 'payer_id');
    }

    // ─── Helpers ─────────────────────────────────────────────────────

    public function verifyPin(string $pin): bool
    {
        return \Hash::check($pin, $this->pin_hash);
    }

    public function hasSufficientBalance(float $amount): bool
    {
        return $this->balance >= $amount;
    }
}
