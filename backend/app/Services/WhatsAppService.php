<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Client\PendingRequest;

class WhatsAppService
{
    private string $url;
    private string $apiKey;

    public function __construct()
    {
        $this->url    = rtrim(config('services.evolution.url'), '/');
        $this->apiKey = config('services.evolution.api_key');
    }

    private function client(): PendingRequest
    {
        return Http::withHeaders(['apikey' => $this->apiKey])->timeout(15);
    }

    private function instanceName(User $user): string
    {
        return 'candidato_' . $user->id;
    }

    public function connect(User $user): array
    {
        $instance = $this->instanceName($user);

        $stateResponse = $this->client()->get("{$this->url}/instance/connectionState/{$instance}");

        if ($stateResponse->successful()) {
            $state = $stateResponse->json('instance.state');

            if ($state === 'open') {
                if (!$user->whatsapp_instance) {
                    $user->update(['whatsapp_instance' => $instance]);
                }
                return ['status' => 'connected'];
            }

            $qrResponse = $this->client()->get("{$this->url}/instance/connect/{$instance}");

            return [
                'status' => 'qrcode',
                'qrcode' => $qrResponse->json('base64'),
            ];
        }

        $response = $this->client()->post("{$this->url}/instance/create", [
            'instanceName' => $instance,
            'qrcode'       => true,
            'integration'  => 'WHATSAPP-BAILEYS',
        ]);

        if (!$response->successful()) {
            throw new \Exception('Não foi possível iniciar a conexão com o WhatsApp.');
        }

        $user->update(['whatsapp_instance' => $instance]);

        return [
            'status' => 'qrcode',
            'qrcode' => $response->json('qrcode.base64'),
        ];
    }

    public function status(User $user): array
    {
        $instance = $user->whatsapp_instance ?? $this->instanceName($user);

        $response = $this->client()->get("{$this->url}/instance/connectionState/{$instance}");

        if (!$response->successful()) {
            return ['status' => 'disconnected'];
        }

        $state = $response->json('instance.state');

        return ['status' => $state === 'open' ? 'connected' : 'disconnected'];
    }

    public function qrcode(User $user): array
    {
        $instance = $user->whatsapp_instance ?? $this->instanceName($user);

        $response = $this->client()
            ->withHeaders(['Cache-Control' => 'no-cache', 'Pragma' => 'no-cache'])
            ->get("{$this->url}/instance/connect/{$instance}");

        if (!$response->successful()) {
            throw new \Exception('Não foi possível obter o QR Code.');
        }

        return [
            'status' => 'qrcode',
            'qrcode' => $response->json('base64'),
        ];
    }

    public function sendText(User $user, string $phone, string $text): void
    {
        $instance = $user->whatsapp_instance ?? $this->instanceName($user);

        // Normaliza o número: remove não-dígitos e garante DDI 55
        $number = preg_replace('/\D/', '', $phone);
        if (!str_starts_with($number, '55')) {
            $number = '55' . $number;
        }

        $response = $this->client()->timeout(30)->post("{$this->url}/message/sendText/{$instance}", [
            'number' => $number,
            'text'   => $text,
        ]);

        if (!$response->successful()) {
            throw new \Exception($response->json('message') ?? 'Falha ao enviar mensagem.');
        }
    }

    public function disconnect(User $user): void
    {
        $instance = $user->whatsapp_instance ?? $this->instanceName($user);

        $this->client()->delete("{$this->url}/instance/delete/{$instance}");

        $user->update(['whatsapp_instance' => null]);
    }
}
