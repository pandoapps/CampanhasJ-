<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\SendCampaignJob;
use App\Models\Campaign;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CampaignController extends Controller
{

    public function index(Request $request): JsonResponse
    {
        $campaigns = $request->user()
            ->campaigns()
            ->withCount('deliveries')
            ->orderByDesc('created_at')
            ->get();

        return response()->json($campaigns);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'         => 'required|string|max:255',
            'description'  => 'nullable|string',
            'message'      => 'required|string',
            'status'       => 'nullable|in:draft,scheduled',
            'scheduled_at' => 'nullable|date',
            'tags'         => 'nullable|array',
            'tags.*'       => 'integer|exists:tags,id',
        ]);

        $campaign = $request->user()->campaigns()->create([
            'name'         => $data['name'],
            'description'  => $data['description'] ?? null,
            'message'      => $data['message'],
            'status'       => $data['status'] ?? 'draft',
            'scheduled_at' => $this->parseScheduledAt($data['scheduled_at'] ?? null),
        ]);

        if (! empty($data['tags'])) {
            $campaign->tags()->sync($data['tags']);
        }

        return response()->json($campaign->load('tags'), 201);
    }

    public function show(Request $request, Campaign $campaign): JsonResponse
    {
        $this->authorizeCampaign($request, $campaign);

        return response()->json($campaign->load(['tags', 'deliveries.contact']));
    }

    public function update(Request $request, Campaign $campaign): JsonResponse
    {
        $this->authorizeCampaign($request, $campaign);

        $data = $request->validate([
            'name'         => 'sometimes|string|max:255',
            'description'  => 'nullable|string',
            'message'      => 'sometimes|string',
            'status'       => 'nullable|in:draft,scheduled,paused',
            'scheduled_at' => 'nullable|date',
            'tags'         => 'nullable|array',
        ]);

        if (array_key_exists('scheduled_at', $data)) {
            $data['scheduled_at'] = $this->parseScheduledAt($data['scheduled_at']);
        }

        $campaign->update($data);

        if (array_key_exists('tags', $data)) {
            $campaign->tags()->sync($data['tags'] ?? []);
        }

        return response()->json($campaign->load('tags'));
    }

    public function destroy(Request $request, Campaign $campaign): JsonResponse
    {
        $this->authorizeCampaign($request, $campaign);
        $campaign->delete();

        return response()->json(['message' => 'Campanha removida com sucesso.']);
    }

    public function send(Request $request, Campaign $campaign): JsonResponse
    {
        $this->authorizeCampaign($request, $campaign);

        abort_if(
            in_array($campaign->status, ['sending', 'completed']),
            422,
            'Campanha não pode ser enviada neste status.'
        );

        $user = $request->user();
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

        return response()->json(['message' => 'Campanha em envio.', 'campaign' => $campaign->fresh()]);
    }

    public function pause(Request $request, Campaign $campaign): JsonResponse
    {
        $this->authorizeCampaign($request, $campaign);
        $campaign->update(['status' => 'paused']);

        return response()->json(['message' => 'Campanha pausada.']);
    }

    public function retryFailed(Request $request, Campaign $campaign): JsonResponse
    {
        $this->authorizeCampaign($request, $campaign);

        $failed = $campaign->deliveries()->where('status', 'failed')->with('contact')->get();

        foreach ($failed as $delivery) {
            $delivery->update(['status' => 'pending', 'error_message' => 'Nenhum canal de envio configurado.']);
        }

        return response()->json(['message' => 'Reenvio concluído.']);
    }

    public function dailyStats(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $days = [];

        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $count = \App\Models\CampaignDelivery::whereHas('campaign', fn($q) => $q->where('user_id', $userId))
                ->where('status', 'sent')
                ->whereDate('sent_at', $date->toDateString())
                ->count();

            $days[] = [
                'date'  => $date->toDateString(),
                'label' => $date->locale('pt_BR')->isoFormat('ddd'),
                'count' => $count,
            ];
        }

        return response()->json($days);
    }

    private function parseScheduledAt(?string $value): ?Carbon
    {
        if (! $value) {
            return null;
        }

        // Frontend envia ISO UTC (ex: "2026-05-17T20:41:00.000Z").
        // Convertemos para o fuso da aplicação antes de gravar, garantindo
        // que a comparação com now() (também no fuso local) seja correta.
        return Carbon::parse($value)->setTimezone(config('app.timezone'));
    }

    private function authorizeCampaign(Request $request, Campaign $campaign): void
    {
        abort_if($campaign->user_id !== $request->user()->id, 403, 'Acesso não autorizado.');
    }
}
