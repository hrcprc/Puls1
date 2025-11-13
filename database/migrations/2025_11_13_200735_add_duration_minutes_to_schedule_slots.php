<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('schedule_slots', function (Blueprint $table) {
            if (! Schema::hasColumn('schedule_slots', 'duration_minutes')) {
                $table->unsignedSmallInteger('duration_minutes')
                    ->default(30)
                    ->after('start_at'); // keep near time fields
            }
        });
    }

    public function down(): void
    {
        Schema::table('schedule_slots', function (Blueprint $table) {
            if (Schema::hasColumn('schedule_slots', 'duration_minutes')) {
                $table->dropColumn('duration_minutes');
            }
        });
    }
};
