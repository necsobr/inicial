<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Speaker extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['name', 'date', 'team_id'];

    protected function casts(): array { return ['date' => 'date']; }

    public function team() { return $this->belongsTo(Team::class); }
}
