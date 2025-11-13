<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UserStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'        => ['required','string','max:120'],
            'email'       => ['required','email','max:255','unique:users,email'],
            'password'    => ['required','string','min:8'],
            'departments' => ['required','array','min:1'],
            'departments.*' => ['integer','exists:departments,id'],
            'role'        => ['required','in:Manager,Worker'], // Supervisor stays global, not here
        ];
    }

    public function messages(): array
    {
        return [
            'departments.required' => 'Select at least one department.',
        ];
    }
}
