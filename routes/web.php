<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

Route::get('/', function () {
    if (Auth::check()) {
        return Inertia::render('Dashboard');
    }
    return Inertia::render('Home');
})->name('home');
    
// Auth pages
Route::prefix('auth')->group(function () {
    Route::get('/login', function () {
        return Inertia::render('Login');
    })->name('auth.login');

    Route::get('/register', function () {
        return Inertia::render('Register');
    })->name('auth.register');
});

// Protect dashboard using session auth (Sanctum SPA flow sets session cookie)
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Project public view
Route::get('/project/{id}', function ($id) {
    return Inertia::render('Project', ['projectId' => $id]);
})->name('project.show');
