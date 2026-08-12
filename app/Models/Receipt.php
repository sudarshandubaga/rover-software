<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Receipt extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'receipt_number',
        'date',
        'amount',
        'payment_mode',
        'transaction_id',
        'remarks',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}
