<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\EnsuresManagerOrSupervisor;
use App\Http\Requests\JobTypeStoreUpdateRequest;
use App\Models\JobType;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class ManagerJobTypesController extends Controller
{
    use EnsuresManagerOrSupervisor;

    public function index()
    {
        $this->ensureManagerOrSupervisor();

        return Inertia::render('manager/job-types', [
            'rows'  => JobType::orderBy('name')->get(['id','name','code','active']),
            'flash' => session('success') ?? session('error'),
        ]);
    }

    public function store(JobTypeStoreUpdateRequest $r): RedirectResponse
    {
        $this->ensureManagerOrSupervisor();

        JobType::create($r->validated());
        return back()->with('success','Job type created.');
    }

    public function update(JobTypeStoreUpdateRequest $r, JobType $jobType): RedirectResponse
    {
        $this->ensureManagerOrSupervisor();

        $jobType->update($r->validated());
        return back()->with('success','Job type updated.');
    }

    public function destroy(JobType $jobType): RedirectResponse
    {
        $this->ensureManagerOrSupervisor();

        if ($jobType->templates()->exists()) {
            return back()->with('error','Cannot delete: templates exist for this type.');
        }
        $jobType->delete();
        return back()->with('success','Job type deleted.');
    }
}
