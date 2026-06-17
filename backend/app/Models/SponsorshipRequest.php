<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SponsorshipRequest extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'company', 'team_id', 'week', 'amount', 'status',
        'applicant_email', 'applicant_name', 'requested_at',
    ];

    protected function casts(): array
    {
        return ['amount' => 'decimal:2', 'requested_at' => 'date'];
    }

    public function team() { return $this->belongsTo(Team::class); }
}
