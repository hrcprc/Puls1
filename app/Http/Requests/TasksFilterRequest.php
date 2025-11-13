<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TasksFilterRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'user_ids'       => ['array'],
            'user_ids.*'     => ['integer','exists:users,id'],
            'department_ids' => ['array'],
            'department_ids.*' => ['integer','exists:departments,id'],
            'shift_id'       => ['nullable','integer','exists:shifts,id'],
            'status'         => ['array'],
            'status.*'       => ['in:planned,in_progress,done,canceled'],
            'date_from'      => ['nullable','date'],
            'date_to'        => ['nullable','date'],
            'page'           => ['nullable','integer','min:1'],
        ];
    }

    public function filters(): array
    {
        $f = $this->validated();
        // defaults: last 7 days, no shift/status filter
        $f['date_from'] = $f['date_from'] ?? now('Europe/Sarajevo')->subDays(6)->toDateString();
        $f['date_to']   = $f['date_to']   ?? now('Europe/Sarajevo')->toDateString();
        $f['user_ids']  = $f['user_ids'] ?? [];
        $f['department_ids'] = $f['department_ids'] ?? [];
        $f['status']    = $f['status'] ?? [];
        return $f;
    }
}
