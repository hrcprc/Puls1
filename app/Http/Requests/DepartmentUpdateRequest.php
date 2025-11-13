// app/Http/Requests/DepartmentUpdateRequest.php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DepartmentUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $id = $this->route('department')->id ?? null;

        return [
            'name'   => 'required|string|max:120',
            'code'   => 'required|string|max:32|unique:departments,code,'.$id,
            'active' => 'boolean',
        ];
    }
}
