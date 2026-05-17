<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TagController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tags = $request->user()
            ->tags()
            ->withCount('contacts')
            ->orderBy('name')
            ->get()
            ->map(fn($tag) => array_merge($tag->toArray(), ['count' => $tag->contacts_count]));

        return response()->json($tags);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'        => 'required|string|max:100',
            'color'       => 'nullable|string|max:10',
            'description' => 'nullable|string|max:500',
        ]);

        $tag = $request->user()->tags()->create($data);

        return response()->json(array_merge($tag->toArray(), ['count' => 0]), 201);
    }

    public function update(Request $request, Tag $tag): JsonResponse
    {
        $this->authorizeTag($request, $tag);

        $data = $request->validate([
            'name'        => 'sometimes|string|max:100',
            'color'       => 'nullable|string|max:10',
            'description' => 'nullable|string|max:500',
        ]);

        $tag->update($data);

        return response()->json($tag->loadCount('contacts'));
    }

    public function destroy(Request $request, Tag $tag): JsonResponse
    {
        $this->authorizeTag($request, $tag);
        $tag->delete();

        return response()->json(['message' => 'Tag removida com sucesso.']);
    }

    private function authorizeTag(Request $request, Tag $tag): void
    {
        abort_if($tag->user_id !== $request->user()->id, 403, 'Acesso não autorizado.');
    }
}
