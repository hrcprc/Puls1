<?php

namespace App\Http\Controllers\Concerns;


use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
trait EnsuresManagerOrSupervisor
{
    protected function ensureManagerOrSupervisor(): void
    {
        $user = auth()->user();
        if (!$user) abort(401, 'Not authenticated');

        // DEBUG: capture what the DB actually has for this user
        $roles = DB::table('user_roles')
            ->join('roles','roles.id','=','user_roles.role_id')
            ->where('user_roles.user_id', $user->id)
            ->selectRaw('LOWER(roles.name) as role, user_roles.department_id')
            ->get()
            ->map(fn($r)=>['role'=>$r->role, 'department_id'=>$r->department_id])
            ->all();

        $ok = collect($roles)->contains(fn($r) =>
            in_array($r['role'], ['supervisor','manager'], true) && $r['department_id'] === null
        );

        // Write to laravel.log so you have a trace
        Log::info('auth.guard.check', ['user_id'=>$user->id, 'roles'=>$roles, 'ok'=>$ok]);


        if (!$ok) {
            // Send a readable reason back (dev only!)
            abort(403, 'Unauthorized: need global Supervisor/Manager. Seen roles='.json_encode($roles));
        }
    }
}
