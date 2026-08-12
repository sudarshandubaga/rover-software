<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookingType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'min_km_per_day',
        'night_charge',
        'rate_per_km',
        'base_price',
    ];

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}
