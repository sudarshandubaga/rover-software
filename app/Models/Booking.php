<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'branch_id',
        'client_id',
        'booking_type_id',
        'vehicle_id',
        'driver_id',
        'firm_id',
        'from_place',
        'to_place',
        'from_date_time',
        'to_date_time',
        'start_km',
        'end_km',
        'toll_charge',
        'parking_charges',
        'border_taxes',
        'driver_allowance',
        'remarks',
        'department',
        'status',
        'public_token',
        'invoice_number',
        'invoice_date',
    ];

    protected $casts = [
        'parking_charges' => 'array',
        'border_taxes' => 'array',
        'driver_allowance' => 'boolean',
        'from_date_time' => 'datetime',
        'to_date_time' => 'datetime',
        'invoice_date' => 'date',
    ];

    protected $appends = [
        'public_url',
    ];

    protected static function booted(): void
    {
        static::creating(function ($booking) {
            if (empty($booking->public_token)) {
                $booking->public_token = Str::random(16);
            }
        });
    }

    public function getPublicUrlAttribute(): string
    {
        return url('/b/' . ($this->public_token ?: ''));
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function bookingType()
    {
        return $this->belongsTo(BookingType::class);
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function firm()
    {
        return $this->belongsTo(Firm::class);
    }

    public function receipts()
    {
        return $this->hasMany(Receipt::class);
    }
}
