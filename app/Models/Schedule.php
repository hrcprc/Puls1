<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Schedule extends Model {
    protected $fillable = ['work_date','department_id','shift_id','created_by'];
    public function slots(){ return $this->hasMany(ScheduleSlot::class); }
}
