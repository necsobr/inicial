<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Team extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name', 'regional', 'city',
        'total_members', 'internal_refs', 'external_refs',
        'meetings_1a1', 'guests', 'education', 'total_business',
    ];

    protected function casts(): array
    {
        return ['total_business' => 'decimal:2'];
    }

    public function users() { return $this->hasMany(User::class); }
    public function members() { return $this->hasMany(Member::class); }
    public function events() { return $this->hasMany(Event::class); }
    public function speakers() { return $this->hasMany(Speaker::class); }
    public function serviceOrders() { return $this->hasMany(ServiceOrder::class); }
    public function notifications() { return $this->hasMany(Notification::class); }
    public function membershipRequests() { return $this->hasMany(MembershipRequest::class); }
}
