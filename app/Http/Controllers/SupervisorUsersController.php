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

// index(): fetch global role (department_id NULL) + departments list
    public function index()
    {
        $this->ensureSupervisor();

        $users = DB::table('users as u')
            ->select('u.id','u.name','u.email')
            ->orderBy('u.name')
            ->get();

        $userDepts = DB::table('user_departments as ud')
            ->join('departments as d','d.id','=','ud.department_id')
            ->select('ud.user_id','d.id as dept_id','d.name as dept_name','d.code as dept_code')
            ->get()
            ->groupBy('user_id');

        $userGlobalRole = DB::table('user_roles as ur')
            ->join('roles as r','r.id','=','ur.role_id')
            ->whereNull('ur.department_id') // global role only
            ->select('ur.user_id','r.name as role')
            ->get()
            ->keyBy('user_id');

        $rows = $users->map(function($u) use ($userDepts,$userGlobalRole){
            $depts = collect($userDepts->get($u->id, []))->map(fn($d)=>[
                'id'=>$d->dept_id, 'name'=>$d->dept_name, 'code'=>$d->dept_code
            ])->values();

            return [
                'id'    => $u->id,
                'name'  => $u->name,
                'email' => $u->email,
                'role'  => $userGlobalRole->get($u->id)->role ?? null,
                'departments' => $depts,
            ];
        });

        $departments = Department::select('id','name','code','active')->orderBy('name')->get();

        return Inertia::render('supervisor/users', [
            'users' => $rows,
            'departments' => $departments,
            'flash' => session('success') ?? session('error'),
        ]);
    }

// store(): assign global role once, attach departments
    public function store(UserStoreRequest $r): RedirectResponse
    {
        $this->ensureSupervisor();

        return DB::transaction(function() use ($r) {
            $user = User::create([
                'name'     => $r->name,
                'email'    => $r->email,
                'password' => Hash::make($r->password),
            ]);

            $deptIds = collect($r->departments)->map(fn($v)=>(int)$v)->values()->all();
            $user->departments()->sync($deptIds);

            $roleId = Role::where('name',$r->role)->value('id');

            // wipe any roles then set ONE global role (department_id NULL)
            DB::table('user_roles')->where('user_id',$user->id)->delete();
            DB::table('user_roles')->insert([
                'user_id' => $user->id,
                'role_id' => $roleId,
                'department_id' => null,
            ]);

            return back()->with('success','User created.');
        });
    }

// update(): update global role; sync departments
    public function update(UserUpdateRequest $r, User $user): RedirectResponse
    {
        $this->ensureSupervisor();

        return DB::transaction(function () use ($r, $user) {
            $user->name  = $r->name;
            $user->email = $r->email;
            if ($r->filled('password')) {
                $user->password = Hash::make($r->password);
            }
            $user->save();

            $deptIds = collect($r->departments)->map(fn($v)=>(int)$v)->values()->all();
            $user->departments()->sync($deptIds);

            $roleId = Role::where('name',$r->role)->value('id');

            // upsert global role
            DB::table('user_roles')->updateOrInsert(
                ['user_id' => $user->id, 'department_id' => null],
                ['role_id' => $roleId]
            );

            return back()->with('success','User updated.');
        });
    }

    public function destroy(\App\Models\User $user): RedirectResponse
    {
        $this->ensureSupervisor();

        return DB::transaction(function () use ($user) {
            DB::table('user_roles')->where('user_id',$user->id)->delete();
            $user->departments()->detach();
            $user->delete();
            return back()->with('success','User deleted.');
        });
    }


}
