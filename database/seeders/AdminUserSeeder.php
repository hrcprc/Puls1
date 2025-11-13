<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        // You can override via .env
        $email = env('PULS1_ADMIN_EMAIL', 'hrvoje1antunovic@gmail.com');
        $name  = env('PULS1_ADMIN_NAME',  'Hrvoje Antunović');
        $pass  = env('PULS1_ADMIN_PASS',  'secret123'); // change in .env for security

        // Ensure MAIN department exists (created by your RbacBootstrapSeeder)
        $deptId = Department::where('code', 'MAIN')->value('id');

        // Ensure roles exist (Supervisor/Manager/Worker) — created by RbacBootstrapSeeder
        $supervisorRoleId = Role::where('name', 'Supervisor')->value('id');

        // Create or update user
        $user = User::updateOrCreate(
            ['email' => $email],
            [
                'name'     => $name,
                // Only set password if new user or you want to reset each seed run:
                'password' => Hash::make($pass),
            ]
        );

        // Attach department MAIN (don’t detach others)
        if ($deptId) {
            $user->departments()->syncWithoutDetaching([$deptId]);
        }

        // Set ONE global role (department_id = NULL)
        if ($supervisorRoleId) {
            DB::table('user_roles')->updateOrInsert(
                ['user_id' => $user->id, 'department_id' => null],
                ['role_id' => $supervisorRoleId]
            );
        }

        $this->command?->info("Admin user ensured: {$email} (Supervisor).");
    }
}
