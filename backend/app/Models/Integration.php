<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Integration extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['name', 'description', 'url', 'api_key', 'instance_name', 'active', 'type'];

    protected function casts(): array { return ['active' => 'boolean']; }

    protected $hidden = ['api_key'];
}
