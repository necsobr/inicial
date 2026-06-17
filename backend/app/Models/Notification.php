<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Notification extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['type', 'message', 'read', 'team_id'];

    protected function casts(): array { return ['read' => 'boolean']; }

    public function team() { return $this->belongsTo(Team::class); }
}
