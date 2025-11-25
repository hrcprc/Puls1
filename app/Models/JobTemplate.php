<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobTemplate extends Model
{
    protected $table = 'job_templates';

    // ✅ allow mass assignment for the fields we create/update
    protected $fillable = [
        'job_type_id',
        'name',
        'code',
        'default_duration',
        'instructions',
        'requires_attachment',
        'active',
    ];

    protected $casts = [
        'default_duration'    => 'integer',
        'requires_attachment' => 'boolean',
        'active'              => 'boolean',
    ];

    public function type(): BelongsTo
    {
        return $this->belongsTo(JobType::class, 'job_type_id');
    }
}
