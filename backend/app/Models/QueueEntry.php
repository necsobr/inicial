<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class QueueEntry extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'service_order_id', 'user_id', 'name', 'company', 'phone',
        'position', 'status', 'joined_at', 'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'joined_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function serviceOrder() { return $this->belongsTo(ServiceOrder::class); }
    public function user() { return $this->belongsTo(User::class); }
}
