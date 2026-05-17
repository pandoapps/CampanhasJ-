<?php

namespace App\Jobs;

use App\Models\Campaign;
use App\Services\WhatsAppService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Throwable;

class SendCampaignJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 3600;
    public int $tries   = 1;

    public function __construct(public Campaign $campaign) {}

    public function handle(WhatsAppService $whatsapp): void
    {
        $campaign = $this->campaign->fresh(['deliveries', 'user']);
        $user     = $campaign->user;

        $pending = $campaign->deliveries()->where('status', 'pending')->with('contact')->get();

        foreach ($pending as $delivery) {
            try {
                $name    = ucwords(mb_strtolower($delivery->contact?->name ?? ''));
                $message = str_replace('{nome}', $name, $campaign->message);

                $whatsapp->sendText($user, $delivery->phone, $message);

                $delivery->update([
                    'status'        => 'sent',
                    'sent_at'       => now(),
                    'error_message' => null,
                ]);
            } catch (Throwable $e) {
                $delivery->update([
                    'status'        => 'failed',
                    'error_message' => $e->getMessage(),
                ]);
            }

            // Pausa entre mensagens para evitar bloqueio do número
            sleep(3);
        }

        $sent   = $campaign->deliveries()->where('status', 'sent')->count();
        $failed = $campaign->deliveries()->where('status', 'failed')->count();

        $campaign->update([
            'status'       => 'completed',
            'sent_at'      => now(),
            'total_sent'   => $sent,
            'total_failed' => $failed,
        ]);
    }
}
