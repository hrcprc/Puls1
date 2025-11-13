<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    protected $fillable = ['name', 'code', 'active'];

    // If you want timestamps (created_at/updated_at), leave as default (true).
    // public $timestamps = true;

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_departments');
    }
}
