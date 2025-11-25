<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\EnsuresManagerOrSupervisor;
use App\Http\Requests\JobTemplateStoreUpdateRequest;
use App\Models\JobTemplate;
use App\Models\JobType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ManagerJobTemplatesController extends Controller
{
    use EnsuresManagerOrSupervisor;

    public function index()
    {
        $this->ensureManagerOrSupervisor();
        return Inertia::render('manager/job-templates', [
            'rows'  => JobTemplate::with('type:id,name')
                ->orderBy('name')
                ->get(['id','job_type_id','name','code','default_duration','requires_attachment','active']),
            'types' => JobType::orderBy('name')->get(['id','name','code']),
            'flash' => session('success') ?? session('error'),
        ]);
    }

    public function store(JobTemplateStoreUpdateRequest $r): \Illuminate\Http\RedirectResponse
    {
        $this->ensureManagerOrSupervisor();

        $data = $r->validated();
        // quick sanity log while testing:
        \Log::info('job_templates.store.validated', $data);

        \App\Models\JobTemplate::create($data);

        return back()->with('success','Job template created.');
    }

    public function update(JobTemplateStoreUpdateRequest $r, JobTemplate $jobTemplate): RedirectResponse
    {
        $this->ensureManagerOrSupervisor();
        $jobTemplate->update($r->validated());
        return back()->with('success','Job template updated.');
    }

    public function destroy(JobTemplate $jobTemplate): RedirectResponse
    {
        $this->ensureManagerOrSupervisor();
        // guard: if used in schedule_slots, block delete
        $used = DB::table('schedule_slots')->where('job_template_id',$jobTemplate->id)->exists();
        if ($used) return back()->with('error','Cannot delete: template used in schedules.');
        $jobTemplate->delete();
        return back()->with('success','Job template deleted.');
    }
}
