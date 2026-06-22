<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ServiceOrder extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'team_id', 'name', 'paper_type', 'copies', 'recurrence', 'day_of_week',
        'single_date', 'meetings_count', 'sponsor_slots', 'quota_price',
        'start_date', 'status', 'created_by',
    ];

    protected function casts(): array
    {
        return [
            'quota_price' => 'decimal:2',
            'start_date' => 'date',
            'single_date' => 'date',
        ];
    }

    public function team() { return $this->belongsTo(Team::class); }
    public function creator() { return $this->belongsTo(User::class, 'created_by'); }
    public function events() { return $this->hasMany(Event::class); }
    public function referenceMaps() { return $this->hasMany(ReferenceMap::class); }
    public function queueEntries() { return $this->hasMany(QueueEntry::class); }
}
