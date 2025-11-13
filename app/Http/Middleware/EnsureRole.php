<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EnsureRole
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = $request->user();
        if (!$user) abort(401);

        $has = DB::table('user_roles')
            ->join('roles','roles.id','=','user_roles.role_id')
            ->where('user_roles.user_id',$user->id)
            ->whereIn('roles.name',$roles)
            ->exists();

        abort_unless($has, 403);
        return $next($request);
    }
}
