<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\EnsuresManagerOrSupervisor;
use App\Models\Department;
use App\Models\JobTemplate;
use App\Models\Schedule;
use App\Models\Shift;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ManagerScheduleController extends Controller
{
    use EnsuresManagerOrSupervisor;

    public function index(Request $r)
    {
        $this->ensureManagerOrSupervisor();
        $me = $r->user();

        // Scope for Manager
        $isSupervisor = DB::table('user_roles')
            ->join('roles','roles.id','=','user_roles.role_id')
            ->whereNull('user_roles.department_id')
            ->where('user_roles.user_id',$me->id)
            ->where('roles.name','Supervisor')->exists();

        $managerDeptIds = $isSupervisor ? null : $me->departments()->pluck('departments.id')->all();

        // Inputs (defaults)
        $tz = 'Europe/Sarajevo';
        $date = $r->input('date', now($tz)->toDateString());

        $departmentsQ = Department::select('id','name','code')->orderBy('name');
        if (!$isSupervisor) $departmentsQ->whereIn('id',$managerDeptIds);
        $departments = $departmentsQ->get();

        $department_id = (int)($r->input('department_id') ?? ($departments->first()->id ?? 0));

        $shifts = Shift::where('active',true)->orderBy('start')->get(['id','name','start','end']);
        $shift_id = (int)($r->input('shift_id') ?? ($shifts->first()->id ?? 0));

        // Ensure schedule sheet exists (idempotent)
        if ($department_id && $shift_id) {
            $schedule = Schedule::firstOrCreate(
                ['work_date'=>$date,'department_id'=>$department_id,'shift_id'=>$shift_id],
                ['created_by'=>$me->id]
            );
        } else {
            $schedule = null;
        }

        // Workers in this dept
        $workers = User::select('users.id','users.name','users.email')
            ->whereIn('users.id', function($q) use ($department_id) {
                $q->from('user_departments')->select('user_id')->where('department_id',$department_id);
            })
            ->orderBy('name')->get();

        // Time grid for the chosen shift (30-min ticks)
        $times = [];
        if ($schedule) {
            $shift = $shifts->firstWhere('id',$shift_id);
            $start = Carbon::parse($date.' '.$shift->start, $tz);
            $end   = Carbon::parse($date.' '.$shift->end, $tz);
            if ($end->lessThanOrEqualTo($start)) $end->addDay(); // overnight
            $cursor = $start->copy();
            while ($cursor < $end) {
                $times[] = $cursor->format('H:i');
                $cursor->addMinutes(30);
            }
        }

        // Existing slots for this schedule
        $slots = [];
        if ($schedule) {
            $rows = DB::table('schedule_slots as ss')
                ->join('job_templates as jt','jt.id','=','ss.job_template_id')
                ->select('ss.id','ss.user_id','ss.start_at','ss.end_at','ss.duration_minutes','ss.status','ss.job_template_id','ss.notes','jt.name as job_name')
                ->where('ss.schedule_id',$schedule->id)
                ->orderBy('ss.start_at')->get();

            foreach ($rows as $row) {
                $startLocal = Carbon::parse($row->start_at)->setTimezone($tz)->format('H:i');
                $slots[] = [
                    'id' => $row->id,
                    'user_id' => $row->user_id,
                    'start' => $startLocal,
                    'duration' => (int)$row->duration_minutes,
                    'end' => Carbon::parse($row->end_at)->setTimezone($tz)->format('H:i'),
                    'status' => $row->status,
                    'job' => $row->job_name,
                    'job_template_id' => $row->job_template_id,
                    'notes' => $row->notes,
                    'start_at_local' => Carbon::parse($row->start_at)->setTimezone($tz)->format('Y-m-d H:i'),
                ];
            }
        }

        $jobTemplates = JobTemplate::where('active',true)->orderBy('name')
            ->get(['id','name','code','default_duration']);

        return Inertia::render('manager/schedule', [
            'filters' => [
                'date'=>$date,
                'department_id'=>$department_id,
                'shift_id'=>$shift_id,
            ],
            'options' => [
                'departments'=>$departments,
                'shifts'=>$shifts,
                'job_templates'=>$jobTemplates,
                'tz'=>$tz,
            ],
            'schedule' => $schedule? [
                'id'=>$schedule->id,
                'times'=>$times,
            ] : null,
            'workers' => $workers,
            'slots'   => $slots, // client will render per-user bars
            'flash'   => session('success') ?? session('error'),
        ]);
    }
}
