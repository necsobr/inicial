<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PrintRequest extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'team_id', 'requester_email', 'requester_name',
        'quantity', 'event_date', 'notes', 'status',
    ];

    protected function casts(): array { return ['event_date' => 'date']; }

    public function team() { return $this->belongsTo(Team::class); }
}
