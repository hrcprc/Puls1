<?php

use App\Http\Controllers\ManagerJobTemplatesController;
use App\Http\Controllers\ManagerJobTypesController;
use App\Http\Controllers\ManagerScheduleController;
use App\Http\Controllers\ManagerShiftsController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\SupervisorDepartmentsController;
use App\Http\Controllers\SupervisorUsersController;
use App\Http\Controllers\SupervisorLocationsController;
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

    Route::get('/supervisor/locations', [SupervisorLocationsController::class,'index'])
        ->name('supervisor.locations.index');
    Route::post('/supervisor/locations', [SupervisorLocationsController::class,'store'])
        ->name('supervisor.locations.store');
    Route::put('/supervisor/locations/{location}', [SupervisorLocationsController::class,'update'])
        ->name('supervisor.locations.update');
    Route::delete('/supervisor/locations/{location}', [SupervisorLocationsController::class,'destroy'])
        ->name('supervisor.locations.destroy');



    Route::get('/supervisor/users', [SupervisorUsersController::class,'index'])
        ->name('supervisor.users.index');

    Route::post('/supervisor/users', [SupervisorUsersController::class,'store'])
        ->name('supervisor.users.store');

    Route::put   ('/supervisor/users/{user}',       [SupervisorUsersController::class,'update']);
    Route::delete('/supervisor/users/{user}',       [SupervisorUsersController::class,'destroy']);


    // Job Types
    Route::get('/manager/job-types',            [ManagerJobTypesController::class, 'index'])->name('manager.job-types.index');
    Route::post('/manager/job-types',           [ManagerJobTypesController::class, 'store'])->name('manager.job-types.store');
    Route::put('/manager/job-types/{jobType}',  [ManagerJobTypesController::class, 'update'])->name('manager.job-types.update');
    Route::delete('/manager/job-types/{jobType}', [ManagerJobTypesController::class, 'destroy'])->name('manager.job-types.destroy');

    // Job Templates
    Route::get('/manager/job-templates',                 [ManagerJobTemplatesController::class, 'index'])->name('manager.job-templates.index');
    Route::post('/manager/job-templates',                [ManagerJobTemplatesController::class, 'store'])->name('manager.job-templates.store');
    Route::put('/manager/job-templates/{jobTemplate}',   [ManagerJobTemplatesController::class, 'update'])->name('manager.job-templates.update');
    Route::delete('/manager/job-templates/{jobTemplate}',[ManagerJobTemplatesController::class, 'destroy'])->name('manager.job-templates.destroy');

    // Shifts
    Route::get('/manager/shifts',           [ManagerShiftsController::class, 'index'])->name('manager.shifts.index');
     Route::post('/manager/shifts',          [ManagerShiftsController::class, 'store'])->name('manager.shifts.store');
    Route::put('/manager/shifts/{shift}',   [ManagerShiftsController::class, 'update'])->name('manager.shifts.update');
    Route::delete('/manager/shifts/{shift}',[ManagerShiftsController::class, 'destroy'])->name('manager.shifts.destroy');



    Route::post('/manager/schedule/slots', [ScheduleSlotsController::class, 'store'])
        ->name('manager.schedule.slots.store');
    Route::put('/manager/schedule/slots/{slot}', [ScheduleSlotsController::class, 'update'])
        ->name('manager.schedule.slots.update');
    Route::delete('/manager/schedule/slots/{slot}', [ScheduleSlotsController::class, 'destroy'])
        ->name('manager.schedule.slots.destroy');
    // Schedule daily grid
    Route::get('/manager/schedule', [ManagerScheduleController::class, 'index'])
        ->name('manager.schedule.index');

    Route::get('/manager/tasks', [TasksDashboardController::class, 'index'])
        ->name('manager.tasks.index');
    //  CSV export
   Route::get('/manager/tasks/export', [TasksDashboardController::class, 'export'])
       ->name('manager.tasks.export');



});

Route::get('/dev/whoami', function () {
    $u = auth()->user();
    if (!$u) return response()->json(['auth' => false]);

    $roles = \Illuminate\Support\Facades\DB::table('user_roles')
        ->join('roles','roles.id','=','user_roles.role_id')
        ->where('user_roles.user_id', $u->id)
        ->selectRaw('roles.name, user_roles.department_id')
        ->get();

    return response()->json([
        'auth' => true,
        'user' => ['id'=>$u->id, 'email'=>$u->email],
        'roles' => $roles,
    ]);
});
require __DIR__.'/settings.php';
