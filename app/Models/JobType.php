<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class JobType extends Model {
    protected $fillable = ['name','code','active'];
    public function templates() { return $this->hasMany(JobTemplate::class); }
}
