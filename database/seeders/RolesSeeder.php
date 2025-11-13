<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RolesSeeder extends Seeder
{
    public function run(): void
    {
        foreach (['Supervisor','Manager','Worker'] as $name) {
            Role::query()->firstOrCreate(['name' => $name], []);
        }
    }
}
