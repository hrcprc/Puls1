<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class LocationRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $id = $this->route('location')?->id;

        return [
            'department_id' => ['required','exists:departments,id'],
            'name' => [
                'required',
                'string',
                'max:120',
                Rule::unique('locations','name')
                    ->where(fn($q)=>$q->where('department_id',$this->input('department_id')))
                    ->ignore($id),
            ],
            'code' => ['nullable','string','max:50'],
            'active' => ['boolean'],
        ];
    }
}
