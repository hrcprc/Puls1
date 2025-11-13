<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DepartmentRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $id = $this->route('department')?->id;
        return [
            'name'   => 'required|string|max:120',
            'code'   => 'required|string|max:32|unique:departments,code,'.($id ?? 'NULL').',id',
            'active' => 'boolean'
        ];
    }
}
