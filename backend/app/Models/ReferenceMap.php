<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ReferenceMap extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'team_id', 'service_order_id', 'event_id',
        'file_name', 'upload_date', 'delivery_date', 'delivery_time',
        'delivery_address', 'uploaded_by',
    ];

    protected function casts(): array
    {
        return ['upload_date' => 'date', 'delivery_date' => 'date'];
    }

    public function team() { return $this->belongsTo(Team::class); }
    public function serviceOrder() { return $this->belongsTo(ServiceOrder::class); }
    public function event() { return $this->belongsTo(Event::class); }
    public function uploader() { return $this->belongsTo(User::class, 'uploaded_by'); }
}
