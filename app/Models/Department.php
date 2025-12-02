<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Department extends Model
{
    protected $fillable = ['name', 'code', 'active'];

    /**
     * Users belonging to this department.
     */
    public function users(): BelongsToMany
    {
        // Pivot: user_departments (user_id, department_id)
        return $this->belongsToMany(User::class, 'user_departments');
    }

    /**
     * Locations that belong to this department.
     */
    public function locations(): HasMany
    {
        return $this->hasMany(Location::class);
    }
}
