<?php

namespace App\Console\Commands;

use App\Jobs\SendCampaignJob;
use App\Models\Campaign;
use Illuminate\Console\Command;

class DispatchScheduledCampaigns extends Command
{
    protected $signature   = 'campaigns:dispatch-scheduled';
    protected $description = 'Dispara campanhas agendadas cujo horário foi atingido';

    public function handle(): void
    {
        $campaigns = Campaign::where('status', 'scheduled')
            ->whereNotNull('scheduled_at')
            ->where('scheduled_at', '<=', now())
            ->with('user')
            ->get();

        foreach ($campaigns as $campaign) {
            $user     = $campaign->user;
            $contacts = $user->contacts()
                ->when($campaign->tags()->exists(), function ($q) use ($campaign) {
                    $q->whereHas('tags', fn($q) => $q->whereIn('tags.id', $campaign->tags()->pluck('tags.id')));
                })
                ->get();

            $campaign->update([
                'status'           => 'sending',
                'total_recipients' => $contacts->count(),
            ]);

            foreach ($contacts as $contact) {
                $campaign->deliveries()->updateOrCreate(
                    ['contact_id' => $contact->id],
                    ['phone' => $contact->phone, 'status' => 'pending', 'error_message' => null, 'sent_at' => null],
                );
            }

            SendCampaignJob::dispatch($campaign);

            $this->info("Campanha #{$campaign->id} '{$campaign->name}' despachada.");
        }

        if ($campaigns->isEmpty()) {
            $this->line('Nenhuma campanha agendada para disparar agora.');
        }
    }
}
