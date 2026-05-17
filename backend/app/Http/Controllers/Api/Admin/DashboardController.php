<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $candidates = User::where('role', 'candidate');

        $monthlyGrowth = [];
        for ($i = 5; $i >= 0; $i--) {
            $monthlyGrowth[] = [
                'month' => now()->subMonths($i)->translatedFormat('M'),
                'count' => User::where('role', 'candidate')
                    ->whereYear('created_at', now()->subMonths($i)->year)
                    ->whereMonth('created_at', now()->subMonths($i)->month)
                    ->count(),
            ];
        }

        return response()->json([
            'total_candidates'  => $candidates->count(),
            'active_campaigns'  => Campaign::where('status', 'sending')->count(),
            'total_messages'    => Campaign::sum('total_sent'),
            'monthly_growth'    => $monthlyGrowth,
        ]);
    }
}
