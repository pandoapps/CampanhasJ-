<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\TagController;
use App\Http\Controllers\Api\CampaignController;
use App\Http\Controllers\Api\WhatsAppController;
use App\Http\Controllers\Api\Admin\CandidateController;
use App\Http\Controllers\Api\Admin\DashboardController;

// Autenticação
Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // Candidato
    Route::middleware('role:candidate')->group(function () {
        Route::apiResource('contacts', ContactController::class);
        Route::post('contacts/import', [ContactController::class, 'import']);
        Route::get('contacts/export', [ContactController::class, 'export']);

        Route::apiResource('tags', TagController::class);

        Route::get('campaigns/stats/daily', [CampaignController::class, 'dailyStats']);
        Route::apiResource('campaigns', CampaignController::class);
        Route::post('campaigns/{campaign}/send', [CampaignController::class, 'send']);
        Route::post('campaigns/{campaign}/pause', [CampaignController::class, 'pause']);
        Route::post('campaigns/{campaign}/retry-failed', [CampaignController::class, 'retryFailed']);

        Route::put('settings/profile', [AuthController::class, 'updateProfile']);
        Route::put('settings/password', [AuthController::class, 'updatePassword']);

        Route::prefix('settings/whatsapp')->group(function () {
            Route::post('connect', [WhatsAppController::class, 'connect']);
            Route::get('status', [WhatsAppController::class, 'status']);
            Route::get('qrcode', [WhatsAppController::class, 'qrcode']);
            Route::delete('disconnect', [WhatsAppController::class, 'disconnect']);
        });
    });

    // Admin
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('dashboard', [DashboardController::class, 'index']);
        Route::apiResource('candidates', CandidateController::class);
        Route::post('candidates/{candidate}/block', [CandidateController::class, 'block']);
        Route::post('candidates/{candidate}/unblock', [CandidateController::class, 'unblock']);
    });
});
