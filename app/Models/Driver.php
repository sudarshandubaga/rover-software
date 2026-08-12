<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Driver extends Model
{
    use HasFactory;

    protected $fillable = [
        'firm_id',
        'name',
        'phone',
        'email',
        'license_number',
        'license_expiry',
        'address',
        'status',
    ];

    public function firm()
    {
        return $this->belongsTo(Firm::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}
