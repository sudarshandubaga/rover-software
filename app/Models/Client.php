<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'phone',
        'email',
        'address',
        'company_name',
        'gst_number',
        'department',
    ];

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}
