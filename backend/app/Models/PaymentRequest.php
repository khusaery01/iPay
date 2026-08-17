<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentRequest extends Model
{
    protected $fillable = [
        'requester_id',
        'payer_id',
        'amount',
        'description',
        'notes',
        'status',
        'transaction_id',
        'expires_at',
    ];

    protected $casts = [
        'amount'     => 'decimal:2',
        'expires_at' => 'datetime',
    ];

    // ─── Relationships ───────────────────────────────────────────────

    public function requester()
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    public function payer()
    {
        return $this->belongsTo(User::class, 'payer_id');
    }

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    // ─── Helpers ─────────────────────────────────────────────────────

    public function isExpired(): bool
    {
        return $this->expires_at && now()->gt($this->expires_at);
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }
}
