<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Services\ContactImportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function __construct(private ContactImportService $contactImportService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $contacts = $request->user()
            ->contacts()
            ->with('tags')
            ->when($request->search, fn($q) => $q->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
                  ->orWhere('phone', 'like', "%{$request->search}%");
            }))
            ->when($request->tag, fn($q) => $q->whereHas('tags', fn($q) => $q->where('tags.id', $request->tag)))
            ->paginate(10);

        return response()->json($contacts);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'notes' => 'nullable|string',
            'tags' => 'nullable|array',
            'tags.*' => 'integer|exists:tags,id',
        ]);

        $contact = $request->user()->contacts()->create($data);

        if (! empty($data['tags'])) {
            $contact->tags()->sync($data['tags']);
        }

        return response()->json($contact->load('tags'), 201);
    }

    public function update(Request $request, Contact $contact): JsonResponse
    {
        abort_if($contact->user_id !== $request->user()->id, 403);

        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20',
            'email' => 'nullable|email|max:255',
            'notes' => 'nullable|string',
            'tags' => 'nullable|array',
        ]);

        $contact->update($data);

        if (array_key_exists('tags', $data)) {
            $contact->tags()->sync($data['tags'] ?? []);
        }

        return response()->json($contact->load('tags'));
    }

    public function destroy(Request $request, Contact $contact): JsonResponse
    {
        abort_if($contact->user_id !== $request->user()->id, 403);
        $contact->delete();
        return response()->json(['message' => 'Contato removido com sucesso.']);
    }

    public function import(Request $request): JsonResponse
    {
        $data = $request->validate(['file' => 'required|file|mimes:csv,txt|max:10240']);

        $result = $this->contactImportService->import($request->user(), $data['file']);

        return response()->json([
            'message' => "{$result['imported']} contato(s) importado(s) com sucesso.",
            ...$result,
        ]);
    }

    public function export(Request $request): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $contacts = $request->user()->contacts()->with('tags')->get();

        return response()->streamDownload(function () use ($contacts) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Nome', 'Telefone', 'Email', 'Tags']);
            foreach ($contacts as $contact) {
                fputcsv($handle, [
                    $contact->name,
                    $contact->phone,
                    $contact->email,
                    $contact->tags->pluck('name')->join(', '),
                ]);
            }
            fclose($handle);
        }, 'contatos.csv');
    }
}
