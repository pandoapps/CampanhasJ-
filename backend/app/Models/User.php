<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'role',
        'plan',
        'status',
        'whatsapp_instance',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function contacts()
    {
        return $this->hasMany(Contact::class);
    }

    public function tags()
    {
        return $this->hasMany(Tag::class);
    }

    public function campaigns()
    {
        return $this->hasMany(Campaign::class);
    }
}
