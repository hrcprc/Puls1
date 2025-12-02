<?php

namespace App\Http\Requests;

use App\Models\Schedule;
use App\Models\ScheduleSlot;
use App\Models\Shift;
use App\Models\Location;
use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class ScheduleSlotUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'schedule_id'      => ['required','exists:schedules,id'],
            'location_id'      => ['required','exists:locations,id'],
            'user_id'          => ['required','exists:users,id'],
            'job_template_id'  => ['required','exists:job_templates,id'],
            'start_at'         => ['required','date'],
            'duration_minutes' => ['required','integer','min:30','max:480'],
            'notes'            => ['nullable','string'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $v) {
            $data = $this->validated();
            if (!isset($data['schedule_id'],$data['start_at'],$data['duration_minutes'],$data['location_id'])) return;

            if ($data['duration_minutes'] % 30 !== 0) {
                $v->errors()->add('duration_minutes','Duration must be a multiple of 30 minutes.');
                return;
            }

            /** @var ScheduleSlot|null $slot */
            $slot = $this->route('slot');

            $schedule = Schedule::with('slots')->find($data['schedule_id']);
            if (! $schedule) return;

            $location = Location::find($data['location_id']);
            if (! $location) return;

            if ($location->department_id !== $schedule->department_id) {
                $v->errors()->add('location_id','Location must belong to the schedule department.');
            }

            if (! $location->active) {
                $v->errors()->add('location_id','Location must be active.');
            }

            if ($slot && $slot->schedule_id !== $schedule->id) {
                $v->errors()->add('schedule_id','Cannot move a slot to a different schedule.');
            }

            $tz = 'Europe/Sarajevo';
            $startLocal = Carbon::parse($data['start_at'], $tz);
            $endLocal   = (clone $startLocal)->addMinutes((int)$data['duration_minutes']);

            if (! $startLocal->isSameDay(Carbon::parse($schedule->work_date, $tz))) {
                $v->errors()->add('start_at','Start must be on schedule work_date.');
            }

            if ($schedule->shift_id) {
                /** @var Shift $shift */
                $shift = Shift::find($schedule->shift_id);
                [$shiftStart, $shiftEnd] = $shift->spanForDate(Carbon::parse($schedule->work_date, $tz), $tz);

                if ($startLocal->lt($shiftStart) || $endLocal->gt($shiftEnd)) {
                    $v->errors()->add('duration_minutes','Slot must fit entirely within the shift.');
                }
            }

            $startUtc = $startLocal->clone()->setTimezone('UTC');
            $endUtc   = $endLocal->clone()->setTimezone('UTC');

            $overlap = ScheduleSlot::where('user_id', $data['user_id'])
                ->where('id','!=',$slot?->id)
                ->where(function ($q) use ($startUtc, $endUtc) {
                    $q->whereBetween('start_at', [$startUtc, $endUtc->copy()->subSecond()])
                        ->orWhereBetween('end_at',   [$startUtc->copy()->addSecond(), $endUtc])
                        ->orWhere(function ($q2) use ($startUtc, $endUtc) {
                            $q2->where('start_at','<=',$startUtc)->where('end_at','>=',$endUtc);
                        });
                })
                ->exists();

            if ($overlap) {
                $v->errors()->add('start_at','User already has a slot overlapping this period.');
            }
        });
    }
}
