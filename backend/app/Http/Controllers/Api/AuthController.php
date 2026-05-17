<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['As credenciais informadas estão incorretas.'],
            ]);
        }

        if ($user->status === 'inactive') {
            return response()->json([
                'message' => 'Sua conta está suspensa. Entre em contato com o suporte.',
            ], 403);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'plan' => $user->plan,
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logout realizado com sucesso.']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $request->user()->id,
            'phone' => 'nullable|string|max:20',
        ]);

        $request->user()->update($request->only('name', 'email', 'phone'));

        return response()->json(['message' => 'Perfil atualizado com sucesso.']);
    }

    public function updatePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if (! Hash::check($request->current_password, $request->user()->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['A senha atual está incorreta.'],
            ]);
        }

        $request->user()->update(['password' => Hash::make($request->password)]);

        return response()->json(['message' => 'Senha alterada com sucesso.']);
    }


}
