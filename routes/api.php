<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\MessagingController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::prefix('profile')->group(function () {
        Route::get('/', [ProfileController::class, 'index']);
        Route::put('/', [ProfileController::class, 'update']);
    });
    Route::prefix('projects')->group(function () {
        Route::post('/', [ProjectController::class, 'store']);  
        Route::put('/{project}', [ProjectController::class, 'update']);  
        Route::post('/copy', [ProjectController::class, 'copy']);
        Route::post('/{project}/share', [ProjectController::class, 'share']);
        Route::delete('/{project}', [ProjectController::class, 'destroy']);
    });
    Route::prefix('tasks')->group(function () {
        Route::post('/', [TaskController::class, 'store']);
        Route::put('/{task}', [TaskController::class, 'update']);
        Route::delete('/{task}', [TaskController::class, 'destroy']);
        Route::post('/{task}/share', [TaskController::class, 'share']);
    });
    Route::post('/send-email', [MessagingController::class, 'sendTestMessage']);
});

Route::prefix('tasks')->group(function () {
    Route::get('/', [TaskController::class, 'index']);
});

Route::prefix('projects')->group(function () {
    Route::get('/', [ProjectController::class, 'index']);
    Route::get('/{project}', [ProjectController::class, 'show']);
});