<?php

namespace App\Http\Controllers;

use App\Http\Requests\UserStoreRequest;
use App\Models\Department;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class SupervisorUsersController extends Controller
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

        // Minimal directory view: users + their departments and role labels
        $users = DB::table('users as u')
            ->select('u.id','u.name','u.email')
            ->orderBy('u.name')
            ->get();

        $userDepts = DB::table('user_departments as ud')
            ->join('departments as d','d.id','=','ud.department_id')
            ->select('ud.user_id','d.id as dept_id','d.name as dept_name','d.code as dept_code')
            ->get()
            ->groupBy('user_id');

        $roleByUserDept = DB::table('user_roles as ur')
            ->join('roles as r','r.id','=','ur.role_id')
            ->select('ur.user_id','ur.department_id','r.name as role')
            ->get()
            ->groupBy(fn($row)=>$row->user_id.'-'.$row->department_id);

        $rows = $users->map(function($u) use ($userDepts,$roleByUserDept){
            $depts = collect($userDepts->get($u->id, []))->map(function($d) use ($roleByUserDept){
                $key = $d->user_id.'-'.$d->dept_id;
                $role = optional($roleByUserDept->get($key, collect())->first())->role;
                return [
                    'id'   => $d->dept_id,
                    'name' => $d->dept_name,
                    'code' => $d->dept_code,
                    'role' => $role, // Manager/Worker (null if not set)
                ];
            })->values();

            return [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'departments' => $depts,
            ];
        });

        $departments = Department::select('id','name','code','active')->orderBy('name')->get();

        return Inertia::render('supervisor/users', [
            'users' => $rows,
            'departments' => $departments,
            'flash' => session('success'),
        ]);
    }

    public function store(UserStoreRequest $r): RedirectResponse
    {
        $this->ensureSupervisor();

        return DB::transaction(function() use ($r) {
            // Create user
            $user = User::create([
                'name' => $r->name,
                'email' => $r->email,
                'password' => Hash::make($r->password),
            ]);

            // Attach departments
            DB::table('user_departments')->insert(
                collect($r->departments)->map(fn($deptId)=>[
                    'user_id'=>$user->id,
                    'department_id'=>$deptId,
                ])->all()
            );

            // Role ID for Manager/Worker
            $roleId = Role::where('name',$r->role)->value('id');

            // Assign role per selected department(s)
            DB::table('user_roles')->insert(
                collect($r->departments)->map(fn($deptId)=>[
                    'user_id'=>$user->id,
                    'role_id'=>$roleId,
                    'department_id'=>$deptId,
                ])->all()
            );

            return back()->with('success','User created.');
        });
    }
}
