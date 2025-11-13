<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * Mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * Hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Casts.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    /**
     * Relationships
     */
    public function departments()
    {
        // pivot: user_departments (user_id, department_id)
        return $this->belongsToMany(\App\Models\Department::class, 'user_departments');
    }

    public function roles()
    {
        // dept-scoped roles in user_roles (user_id, role_id, department_id)
        return $this->hasMany(\App\Models\UserRole::class);
    }


    public function primaryRole() // global role
    {
        return $this->hasOne(\App\Models\UserRole::class)->whereNull('department_id')->with('role');
    }

    /**
     * Check if user has a role (optionally scoped to a department).
     *
     * @example $user->hasRole('Supervisor');           // global
     * @example $user->hasRole('Manager', $deptId);     // dept-scoped
     */
    public function hasRole(string $roleName, ?int $departmentId = null): bool
    {
        return (bool) optional($this->primaryRole)->role?->name === $roleName;

    }
}
