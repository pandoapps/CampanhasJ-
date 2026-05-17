<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CampaignDelivery extends Model
{
    protected $fillable = [
        'campaign_id', 'contact_id', 'phone', 'status', 'error_message', 'sent_at',
    ];

    protected $casts = ['sent_at' => 'datetime'];

    public function campaign()
    {
        return $this->belongsTo(Campaign::class);
    }

    public function contact()
    {
        return $this->belongsTo(Contact::class);
    }
}
