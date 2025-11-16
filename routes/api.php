<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\ProjectController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::prefix('projects')->group(function () {
        Route::post('/', [ProjectController::class, 'store']);  
        Route::post('/copy', [ProjectController::class, 'copy']);
    });
    Route::prefix('tasks')->group(function () {
        Route::post('/', [TaskController::class, 'store']);
        Route::put('/{task}', [TaskController::class, 'update']);
        Route::delete('/{task}', [TaskController::class, 'destroy']);
    });
});

Route::prefix('tasks')->group(function () {
    Route::get('/', [TaskController::class, 'index']);
});

Route::prefix('projects')->group(function () {
    Route::get('/', [ProjectController::class, 'index']);  
});