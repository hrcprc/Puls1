<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('locations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('department_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('code');
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->unique(['department_id', 'code']);
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
