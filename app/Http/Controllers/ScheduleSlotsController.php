<?php

namespace App\Http\Controllers;

use App\Http\Requests\ScheduleSlotStoreRequest;
use App\Http\Requests\ScheduleSlotUpdateRequest;
use App\Models\ScheduleSlot;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;

class ScheduleSlotsController extends Controller
{
    public function store(ScheduleSlotStoreRequest $r): RedirectResponse
    {
        $tz    = 'Europe/Sarajevo';
        $start = Carbon::parse($r->start_at, $tz);
        $end   = (clone $start)->addMinutes((int) $r->duration_minutes);

        ScheduleSlot::create([
            'schedule_id'      => $r->schedule_id,
            'user_id'          => $r->user_id,
            'job_template_id'  => $r->job_template_id,
            'location_id'      => $r->location_id,
            'start_at'         => $start->clone()->setTimezone('UTC'),
            'duration_minutes' => (int) $r->duration_minutes,
            'end_at'           => $end->clone()->setTimezone('UTC'),
            'status'           => 'planned',
            'notes'            => $r->notes,
        ]);

        return back()->with('success', 'Slot added.');
    }

    public function update(ScheduleSlotUpdateRequest $r, ScheduleSlot $slot): RedirectResponse
    {
        $tz    = 'Europe/Sarajevo';
        $start = Carbon::parse($r->start_at, $tz);
        $end   = (clone $start)->addMinutes((int) $r->duration_minutes);

        $slot->update([
            'schedule_id'      => $r->schedule_id,
            'user_id'          => $r->user_id,
            'job_template_id'  => $r->job_template_id,
            'location_id'      => $r->location_id,
            'start_at'         => $start->clone()->setTimezone('UTC'),
            'duration_minutes' => (int) $r->duration_minutes,
            'end_at'           => $end->clone()->setTimezone('UTC'),
            'notes'            => $r->notes,
        ]);

        return back()->with('success', 'Slot updated.');
    }

    public function destroy(ScheduleSlot $slot): RedirectResponse
    {
        $slot->delete();

        return back()->with('success', 'Slot deleted.');
    }
}
