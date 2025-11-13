<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class JobTemplate extends Model {
    protected $fillable = ['job_type_id','name','code','default_duration','instructions','requires_attachment','active'];
    public function type() { return $this->belongsTo(JobType::class,'job_type_id'); }
}
