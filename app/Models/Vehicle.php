<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehicle_number',
        'model',
        'brand',
        'type',
        'capacity',
        'status',
        'rc_expiry',
        'insurance_expiry',
        'puc_expiry',
    ];

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}
