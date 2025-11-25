<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class JobTypeStoreUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // guard is handled in controller
    }

    public function rules(): array
    {
        // when updating, route-model binding variable is `jobType`
        $id = $this->route('jobType')?->id ?? null;

        return [
            'name'   => ['required', 'string', 'max:120', Rule::unique('job_types','name')->ignore($id)],
            'code'   => ['nullable', 'string', 'max:64', Rule::unique('job_types','code')->ignore($id)],
            'active' => ['nullable', 'boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'active' => filter_var($this->input('active', true), FILTER_VALIDATE_BOOLEAN),
        ]);
    }
}
