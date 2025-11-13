<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\SupervisorDepartmentsController;
use App\Http\Controllers\SupervisorUsersController;

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

    Route::get('/supervisor/users', [SupervisorUsersController::class,'index'])
        ->name('supervisor.users.index');

    Route::post('/supervisor/users', [SupervisorUsersController::class,'store'])
        ->name('supervisor.users.store');


});

require __DIR__.'/settings.php';
