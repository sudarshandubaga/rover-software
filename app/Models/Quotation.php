<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Quotation extends Model
{
    use HasFactory;

    protected $fillable = [
        'lead_id',
        'quotation_number',
        'date',
        'total_amount',
        'details',
        'status',
    ];

    protected $casts = [
        'details' => 'array',
        'date' => 'date',
    ];

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }
}
