<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ShiftStoreUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // let the controller/guard handle authz
    }

    public function rules(): array
    {
        return [
            'name'   => ['required','string','max:80'],
            'start'  => ['required','date_format:H:i'],
            'end'    => ['required','date_format:H:i'],
            'active' => ['boolean'],
        ];
    }
}
