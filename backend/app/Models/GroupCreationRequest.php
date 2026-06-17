<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class GroupCreationRequest extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id', 'requester_name', 'requester_email', 'phone', 'company',
        'group_name', 'regional', 'city', 'requested_at', 'status',
    ];

    protected function casts(): array { return ['requested_at' => 'date']; }

    public function user() { return $this->belongsTo(User::class); }
}
