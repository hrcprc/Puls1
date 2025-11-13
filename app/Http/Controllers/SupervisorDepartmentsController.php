<?php

namespace App\Http\Controllers;

use App\Http\Requests\DepartmentRequest;
use App\Models\Department;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SupervisorDepartmentsController extends Controller
{
    private function ensureSupervisor(): void
    {
        $user = auth()->user();
        abort_unless($user, 401);

        $isSupervisor = DB::table('user_roles')
            ->join('roles','roles.id','=','user_roles.role_id')
            ->where('user_roles.user_id',$user->id)
            ->where('roles.name','Supervisor')
            ->exists();

        abort_unless($isSupervisor, 403);
    }

    public function index()
    {
        $this->ensureSupervisor();

        return Inertia::render('supervisor/departments', [
            'departments' => Department::select('id','name','code','active')
                ->orderBy('name')->get(),
            'flash' => session('success'),
        ]);
    }

    public function store(DepartmentRequest $r): RedirectResponse
    {
        $this->ensureSupervisor();

        Department::create($r->validated());
        return back()->with('success', 'Department created.');
    }
}
