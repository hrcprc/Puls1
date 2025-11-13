<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RbacBootstrapSeeder extends Seeder
{
    public function run(): void
    {
        foreach (['Supervisor','Manager','Worker'] as $name) {
            DB::table('roles')->updateOrInsert(['name'=>$name], []);
        }

        DB::table('departments')->updateOrInsert(
            ['code'=>'MAIN'],
            ['name'=>'Maintenance','active'=>true, 'updated_at'=>now(), 'created_at'=>now()]
        );
    }
}
