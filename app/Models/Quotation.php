<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Quotation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'branch_id',
        'lead_id',
        'quotation_number',
        'public_token',
        'date',
        'total_amount',
        'details',
        'status',
    ];

    protected $casts = [
        'details' => 'array',
        'date' => 'date',
    ];

    protected $appends = [
        'public_url',
    ];

    protected static function booted(): void
    {
        static::creating(function ($quotation) {
            if (empty($quotation->public_token)) {
                $quotation->public_token = Str::random(16);
            }
        });
    }

    public function getPublicUrlAttribute(): string
    {
        return url('/q/' . ($this->public_token ?: ''));
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }
}
