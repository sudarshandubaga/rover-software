<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lead extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_name',
        'phone',
        'email',
        'source',
        'requirements',
        'status',
    ];

    public function followups()
    {
        return $this->hasMany(Followup::class);
    }

    public function quotations()
    {
        return $this->hasMany(Quotation::class);
    }
}
