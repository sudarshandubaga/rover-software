<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Branch extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'city',
        'address',
        'phone',
        'email',
        'status',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function managers()
    {
        return $this->hasMany(User::class)->where('role', 'manager');
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function leads()
    {
        return $this->hasMany(Lead::class);
    }

    public function quotations()
    {
        return $this->hasMany(Quotation::class);
    }

    public function clients()
    {
        return $this->hasMany(Client::class);
    }

    public function drivers()
    {
        return $this->hasMany(Driver::class);
    }

    public function vehicles()
    {
        return $this->hasMany(Vehicle::class);
    }
}
