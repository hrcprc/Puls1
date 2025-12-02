<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Location extends Model
{
    protected $fillable = [
        'department_id',
        'name',
        'code',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function scheduleSlots(): HasMany
    {
        return $this->hasMany(ScheduleSlot::class);
    }
}
