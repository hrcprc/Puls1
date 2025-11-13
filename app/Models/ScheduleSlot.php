<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class ScheduleSlot extends Model {
    protected $fillable = [
        'schedule_id',
        'user_id',
        'job_template_id',
        'start_at',
        'duration_minutes',
        'end_at',
        'status',
        'notes',
    ];

    public function job()      { return $this->belongsTo(JobTemplate::class, 'job_template_id'); }
    public function schedule() { return $this->belongsTo(Schedule::class); }
}
