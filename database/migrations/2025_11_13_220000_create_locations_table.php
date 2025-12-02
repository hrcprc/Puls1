<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('locations', function (Blueprint $t) {
            $t->id();
            $t->foreignId('department_id')->constrained()->cascadeOnDelete();
            $t->string('name');
            $t->timestamps();
        });

        Schema::table('schedule_slots', function (Blueprint $t) {
            $t->foreignId('location_id')->after('job_template_id')->nullable()->constrained('locations')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('schedule_slots', function (Blueprint $t) {
            $t->dropConstrainedForeignId('location_id');
        });

        Schema::dropIfExists('locations');
    }
};
