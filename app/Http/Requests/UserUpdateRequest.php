// app/Http/Requests/UserUpdateRequest.php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $id = $this->route('user')->id ?? null;

        return [
            'name'        => ['required','string','max:120'],
            'email'       => ['required','email','max:255', Rule::unique('users','email')->ignore($id)],
            'password'    => ['nullable','string','min:8'], // only if changing
            'departments' => ['required','array','min:1'],
            'departments.*' => ['integer','exists:departments,id'],
            'role'        => ['required','in:Manager,Worker'],
        ];
    }
}
