<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
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
