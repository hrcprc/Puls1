<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            AdminUserSeeder::class,     // creates user, sets Supervisor, attaches MAIN

            RbacBootstrapSeeder::class,     // roles + MAIN department
            PromoteSupervisorSeeder::class, // promote hrvoje1antunovic@gmail.com
        ]);
    }
}
