<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'branch_id',
        'name',
        'phone',
        'email',
        'address',
        'company_name',
        'gst_number',
        'department',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}
