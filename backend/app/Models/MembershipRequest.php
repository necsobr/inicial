<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MembershipRequest extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['user_id', 'team_id', 'phone', 'status', 'requested_at'];

    protected function casts(): array { return ['requested_at' => 'date']; }

    public function user() { return $this->belongsTo(User::class); }
    public function team() { return $this->belongsTo(Team::class); }
}
