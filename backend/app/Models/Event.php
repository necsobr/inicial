<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Event extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['title', 'date', 'time', 'location', 'type', 'team_id', 'service_order_id'];

    protected function casts(): array
    {
        return ['date' => 'date'];
    }

    public function team() { return $this->belongsTo(Team::class); }
    public function serviceOrder() { return $this->belongsTo(ServiceOrder::class); }
    public function referenceMap() { return $this->hasOne(ReferenceMap::class); }
}
