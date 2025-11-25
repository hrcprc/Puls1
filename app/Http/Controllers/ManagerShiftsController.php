<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\EnsuresManagerOrSupervisor;
use App\Http\Requests\ShiftStoreUpdateRequest;
use App\Models\Shift;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ManagerShiftsController extends Controller
{
    use EnsuresManagerOrSupervisor;

    public function index()
    {
        $this->ensureManagerOrSupervisor();

        return Inertia::render('manager/shifts', [
            'rows' => Shift::orderBy('name')->get(['id','name','start','end','active']),
            'flash'=> session('success') ?? session('error'),
        ]);
    }

    public function store(ShiftStoreUpdateRequest $r): RedirectResponse
    {
        $this->ensureManagerOrSupervisor();

        Shift::create($r->validated());
        return back()->with('success','Shift created.');
    }

    public function update(ShiftStoreUpdateRequest $r, Shift $shift): RedirectResponse
    {
        $this->ensureManagerOrSupervisor();
        $shift->update($r->validated());
        return back()->with('success','Shift updated.');
    }

    public function destroy(Shift $shift): RedirectResponse
    {
        $this->ensureManagerOrSupervisor();
        // block delete if schedules reference this shift
        $used = DB::table('schedules')->where('shift_id',$shift->id)->exists();
        if ($used) return back()->with('error','Cannot delete: shift used by schedules.');
        $shift->delete();
        return back()->with('success','Shift deleted.');
    }
}
