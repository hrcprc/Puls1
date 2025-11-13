<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    public $timestamps = false;

    protected $fillable = ['name']; // Supervisor, Manager, Worker

    /**
     * User-role assignments (possibly dept-scoped).
     */
    public function userRoles(): HasMany
    {
        return $this->hasMany(UserRole::class);
    }
}
