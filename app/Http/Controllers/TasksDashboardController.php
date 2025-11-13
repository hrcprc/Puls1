<?php

namespace App\Http\Controllers;

use App\Http\Requests\TasksFilterRequest;
use App\Models\Department;
use App\Models\ScheduleSlot;
use App\Models\Shift;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TasksDashboardController extends Controller
{
    private function ensureSupervisorOrManager(): void
    {
        $user = auth()->user();
        abort_unless($user, 401);

        $has = DB::table('user_roles')
            ->join('roles','roles.id','=','user_roles.role_id')
            ->where('user_roles.user_id',$user->id)
            ->whereNull('user_roles.department_id') // global role
            ->whereIn('roles.name',['Supervisor','Manager'])
            ->exists();

        abort_unless($has, 403);
    }

    public function index(TasksFilterRequest $req)
    {
        $this->ensureSupervisorOrManager();
        $me = auth()->user();

        $f = $req->filters(); // normalized filters

        // Scope: Supervisors see all; Managers limited to their departments
        $managerDeptIds = [];
        $isSupervisor = DB::table('user_roles')
            ->join('roles','roles.id','=','user_roles.role_id')
            ->where('user_roles.user_id',$me->id)
            ->whereNull('user_roles.department_id')
            ->where('roles.name','Supervisor')
            ->exists();

        if (! $isSupervisor) {
            $managerDeptIds = $me->departments()->pluck('departments.id')->all();
            if (empty($f['department_ids'])) {
                $f['department_ids'] = $managerDeptIds;
            } else {
                // intersect requested with allowed
                $f['department_ids'] = array_values(array_intersect($f['department_ids'], $managerDeptIds));
            }
        }

        // Query base
        $base = ScheduleSlot::query()
            ->join('schedules as s','s.id','=','schedule_slots.schedule_id')
            ->join('users as u','u.id','=','schedule_slots.user_id')
            ->leftJoin('departments as d','d.id','=','s.department_id')
            ->leftJoin('shifts as sh','sh.id','=','s.shift_id')
            ->leftJoin('job_templates as jt','jt.id','=','schedule_slots.job_template_id')
            ->select([
                'schedule_slots.id',
                's.work_date',
                'schedule_slots.start_at',
                'schedule_slots.end_at',
                'schedule_slots.duration_minutes',
                'schedule_slots.status',
                'schedule_slots.notes',
                'u.id as user_id','u.name as user_name','u.email as user_email',
                'd.id as department_id','d.name as department_name','d.code as department_code',
                'sh.id as shift_id','sh.name as shift_name',
                'jt.id as job_template_id','jt.name as job_name','jt.code as job_code',
            ])
            ->whereBetween('s.work_date', [$f['date_from'], $f['date_to']])
            ->when($f['user_ids'], fn($q) => $q->whereIn('u.id', $f['user_ids']))
            ->when($f['department_ids'], fn($q) => $q->whereIn('d.id', $f['department_ids']))
            ->when($f['shift_id'] ?? null, fn($q,$sid) => $q->where('sh.id',$sid))
            ->when($f['status'], fn($q) => $q->whereIn('schedule_slots.status', $f['status']))
            ->orderBy('s.work_date')->orderBy('schedule_slots.start_at');

        // Pagination
        $rows = (clone $base)->paginate(25)->withQueryString();

        // Metrics (same filters)
        $byStatus = (clone $base)
            ->selectRaw('schedule_slots.status, COUNT(*) as c, COALESCE(SUM(schedule_slots.duration_minutes),0) as minutes')
            ->groupBy('schedule_slots.status')
            ->pluck('c','status')
            ->all();

        $totalMinutes = (clone $base)->sum('schedule_slots.duration_minutes');

        // Filter options (respect scope)
        $departments = Department::select('id','name','code')
            ->when(!$isSupervisor, fn($q)=>$q->whereIn('id',$managerDeptIds))
            ->orderBy('name')->get();

        $users = User::select('id','name','email')
            ->when(!$isSupervisor && $managerDeptIds, function($q) use ($managerDeptIds) {
                $q->whereIn('id', DB::table('user_departments')
                    ->select('user_id')->whereIn('department_id',$managerDeptIds));
            })
            ->orderBy('name')->get();

        $shifts = Shift::select('id','name')->orderBy('name')->get();

        return Inertia::render('manager/tasks', [
            'filters'     => $f,
            'rows'        => $rows,
            'metrics'     => [
                'by_status' => $byStatus,
                'total_minutes' => (int) $totalMinutes,
            ],
            'options'     => [
                'departments' => $departments,
                'users'       => $users,
                'shifts'      => $shifts,
                'statuses'    => ['planned','in_progress','done','canceled'],
            ],
            'tz'          => 'Europe/Sarajevo',
            'flash'       => session('success') ?? session('error'),
        ]);
    }

    // Optional CSV export (same filters), enable route above if you want
    // public function export(TasksFilterRequest $req) { /* Stream CSV here */ }
}
