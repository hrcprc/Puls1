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

        DB::table('job_types')->updateOrInsert(['code'=>'MECH'], ['name'=>'Mechanical','active'=>true,'created_at'=>now(),'updated_at'=>now()]);
        DB::table('job_types')->updateOrInsert(['code'=>'ELEC'], ['name'=>'Electrical','active'=>true,'created_at'=>now(),'updated_at'=>now()]);

        $mechId = DB::table('job_types')->where('code','MECH')->value('id');
        $elecId = DB::table('job_types')->where('code','ELEC')->value('id');

        DB::table('job_templates')->updateOrInsert(['code'=>'INSP_CONVEYOR'], [
            'job_type_id'=>$mechId,'name'=>'Inspect conveyor belt','default_duration'=>30,'active'=>true,'created_at'=>now(),'updated_at'=>now()
        ]);
        DB::table('job_templates')->updateOrInsert(['code'=>'LUBE_BEARINGS'], [
            'job_type_id'=>$mechId,'name'=>'Lubricate bearings','default_duration'=>30,'active'=>true,'created_at'=>now(),'updated_at'=>now()
        ]);
        DB::table('job_templates')->updateOrInsert(['code'=>'CHK_PANEL'], [
            'job_type_id'=>$elecId,'name'=>'Check control panel','default_duration'=>30,'active'=>true,'created_at'=>now(),'updated_at'=>now()
        ]);

        $departments = DB::table('departments')->get(['id','code','name']);

        foreach ($departments as $department) {
            DB::table('locations')->updateOrInsert(
                ['department_id' => $department->id, 'code' => "{$department->code}_MAIN"],
                [
                    'name' => "{$department->name} - Main Location",
                    'active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}
