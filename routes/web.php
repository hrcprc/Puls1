<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\SupervisorDepartmentsController;
use App\Http\Controllers\SupervisorUsersController;
use App\Http\Controllers\ScheduleSlotsController;
use App\Http\Controllers\TasksDashboardController;

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
    Route::put   ('/supervisor/departments/{department}',    [SupervisorDepartmentsController::class,'update']);
    Route::delete('/supervisor/departments/{department}',    [SupervisorDepartmentsController::class,'destroy']);



    Route::get('/supervisor/users', [SupervisorUsersController::class,'index'])
        ->name('supervisor.users.index');

    Route::post('/supervisor/users', [SupervisorUsersController::class,'store'])
        ->name('supervisor.users.store');

    Route::put   ('/supervisor/users/{user}',       [SupervisorUsersController::class,'update']);
    Route::delete('/supervisor/users/{user}',       [SupervisorUsersController::class,'destroy']);


    Route::post('/manager/schedule/slots', [ScheduleSlotsController::class, 'store'])
        ->name('manager.schedule.slots.store');

    Route::get('/manager/tasks', [TasksDashboardController::class, 'index'])
        ->name('manager.tasks.index');
    //  CSV export
   Route::get('/manager/tasks/export', [TasksDashboardController::class, 'export'])
       ->name('manager.tasks.export');
});

require __DIR__.'/settings.php';
