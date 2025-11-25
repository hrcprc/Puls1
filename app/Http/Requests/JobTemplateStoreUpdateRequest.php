<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class JobTemplateStoreUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'job_type_id'        => ['required','integer','exists:job_types,id'],
            'name'               => ['required','string','max:120'],
            'code'               => ['nullable','string','max:64'],
            'default_duration'   => ['required','integer','in:30,60,90,120'], // your allowed buckets
            'instructions'       => ['nullable','string','max:5000'],
            'requires_attachment'=> ['nullable','boolean'],
            'active'             => ['nullable','boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'requires_attachment' => filter_var($this->input('requires_attachment', false), FILTER_VALIDATE_BOOLEAN),
            'active'              => filter_var($this->input('active', true), FILTER_VALIDATE_BOOLEAN),
        ]);
    }


}
