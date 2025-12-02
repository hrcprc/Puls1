<?php

namespace App\Http\Controllers;

use App\Http\Requests\LocationRequest;
use App\Models\Department;
use App\Models\Location;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SupervisorLocationsController extends Controller
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

        $locations = Location::query()
            ->select('locations.id','locations.name','locations.code','locations.active','locations.department_id','d.name as department_name','d.code as department_code')
            ->join('departments as d','d.id','=','locations.department_id')
            ->orderBy('d.name')
            ->orderBy('locations.name')
            ->get();

        return Inertia::render('supervisor/locations', [
            'locations' => $locations,
            'departments' => Department::select('id','name','code')->orderBy('name')->get(),
            'flash' => session('success') ?? session('error'),
        ]);
    }

    public function store(LocationRequest $request): RedirectResponse
    {
        $this->ensureSupervisor();
        Location::create($request->validated());

        return back()->with('success', 'Location created.');
    }

    public function update(LocationRequest $request, Location $location): RedirectResponse
    {
        $this->ensureSupervisor();
        $location->update($request->validated());

        return back()->with('success','Location updated.');
    }

    public function destroy(Location $location): RedirectResponse
    {
        $this->ensureSupervisor();

        if ($location->scheduleSlots()->exists()) {
            return back()->with('error','Cannot delete a location while tasks are assigned to it.');
        }

        $location->delete();

        return back()->with('success','Location deleted.');
    }
}
