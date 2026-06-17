<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Member extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['name', 'company', 'specialty', 'contact', 'level', 'team_id', 'user_id'];

    public function team() { return $this->belongsTo(Team::class); }
    public function user() { return $this->belongsTo(User::class); }
}
