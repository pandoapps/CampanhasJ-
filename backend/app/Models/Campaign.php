<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Campaign extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'name',
        'description',
        'message',
        'status',
        'scheduled_at',
        'sent_at',
        'total_recipients',
        'total_sent',
        'total_failed',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'sent_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'campaign_tag');
    }

    public function deliveries()
    {
        return $this->hasMany(CampaignDelivery::class);
    }
}
