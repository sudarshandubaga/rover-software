<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SmsLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'recipient',
        'template_title',
        'template_id',
        'message',
        'gateway_url',
        'status',
        'http_code',
        'response_body',
        'booking_id',
        'quotation_id',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function quotation()
    {
        return $this->belongsTo(Quotation::class);
    }
}
