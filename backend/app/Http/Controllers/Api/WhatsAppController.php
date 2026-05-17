<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\WhatsAppService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WhatsAppController extends Controller
{
    public function __construct(private WhatsAppService $service) {}

    public function connect(Request $request): JsonResponse
    {
        try {
            $result = $this->service->connect($request->user());
            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function status(Request $request): JsonResponse
    {
        $result = $this->service->status($request->user());
        return response()->json($result);
    }

    public function qrcode(Request $request): JsonResponse
    {
        try {
            $result = $this->service->qrcode($request->user());
            return response()->json($result)
                ->withHeaders([
                    'Cache-Control' => 'no-cache, no-store, must-revalidate',
                    'Pragma'        => 'no-cache',
                    'Expires'       => '0',
                ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function disconnect(Request $request): JsonResponse
    {
        try {
            $this->service->disconnect($request->user());
            return response()->json(['status' => 'disconnected']);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
}
