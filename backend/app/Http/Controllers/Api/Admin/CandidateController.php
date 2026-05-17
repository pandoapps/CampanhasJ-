<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class CandidateController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $candidates = User::where('role', 'candidate')
            ->withCount(['contacts', 'campaigns'])
            ->when($request->search, fn($q) => $q->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            }))
            ->when($request->plan, fn($q) => $q->where('plan', $request->plan))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($candidates);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'  => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'phone' => 'nullable|string|max:20',
            'plan'  => 'nullable|in:basic,profissional,enterprise',
        ]);

        $candidate = User::create([
            ...$data,
            'password' => Hash::make('123456'),
            'role'     => 'candidate',
            'status'   => 'active',
        ]);

        return response()->json($candidate, 201);
    }

    public function update(Request $request, User $candidate): JsonResponse
    {
        abort_if($candidate->role !== 'candidate', 422, 'Usuário não é um candidato.');

        $data = $request->validate([
            'name'  => 'sometimes|string|max:255',
            'email' => "sometimes|email|unique:users,email,{$candidate->id}",
            'phone' => 'nullable|string|max:20',
            'plan'  => 'nullable|in:basic,profissional,enterprise',
        ]);

        $candidate->update($data);

        return response()->json($candidate);
    }

    public function block(User $candidate): JsonResponse
    {
        abort_if($candidate->role !== 'candidate', 422, 'Usuário não é um candidato.');
        $candidate->update(['status' => 'inactive']);

        return response()->json(['message' => 'Candidato bloqueado.']);
    }

    public function unblock(User $candidate): JsonResponse
    {
        $candidate->update(['status' => 'active']);

        return response()->json(['message' => 'Candidato desbloqueado.']);
    }
}
