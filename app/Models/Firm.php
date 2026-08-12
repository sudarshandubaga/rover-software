<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Firm extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'logo',
        'address',
        'phone',
        'email',
        'gst_number',
        'pan_number',
        'bank_name',
        'bank_account_no',
        'bank_ifsc',
    ];

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function drivers()
    {
        return $this->hasMany(Driver::class);
    }
}
