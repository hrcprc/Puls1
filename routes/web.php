<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\SupervisorDepartmentsController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('/supervisor/departments', [SupervisorDepartmentsController::class,'index'])
        ->name('supervisor.departments');
    Route::post('/supervisor/departments', [SupervisorDepartmentsController::class,'store']);
});

require __DIR__.'/settings.php';
