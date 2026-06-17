<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name', 'email', 'password', 'role', 'team_id',
        'phone', 'company', 'active', 'pending', 'group_creation_request_id',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'active' => 'boolean',
            'pending' => 'boolean',
        ];
    }

    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    public function member()
    {
        return $this->hasOne(Member::class);
    }

    public function groupCreationRequest()
    {
        return $this->belongsTo(GroupCreationRequest::class);
    }

    public function isAdmin(): bool { return $this->role === 'admin'; }
    public function isCoordenador(): bool { return $this->role === 'coordenador'; }
    public function isTrio(): bool { return $this->role === 'trio'; }
    public function isMembro(): bool { return $this->role === 'membro'; }
    public function isProducao(): bool { return $this->role === 'producao'; }
}
