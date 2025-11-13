<?php

// 2025_11_13_120100_create_scheduling_tables.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        // Optional: named shifts (Supervisor-defined)
        Schema::create('shifts', function (Blueprint $t) {
            $t->id();
            $t->string('name');                  // e.g. "Morning"
            $t->time('start');                   // local shift start
            $t->time('end');                     // local shift end
            $t->boolean('active')->default(true);
            $t->timestamps();
        });

        // Daily schedule "header" (one per date/department)
        Schema::create('schedules', function (Blueprint $t) {
            $t->id();
            $t->date('work_date');               // local date (Europe/Sarajevo)
            $t->foreignId('department_id')->constrained()->cascadeOnDelete();
            $t->foreignId('shift_id')->nullable()->constrained('shifts')->nullOnDelete();
            $t->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $t->timestamps();
            $t->unique(['work_date','department_id','shift_id']); // one sheet per day/shift/department
        });

        // Atomic 30-minute slot assignments
        Schema::create('schedule_slots', function (Blueprint $t) {
            $t->id();
            $t->foreignId('schedule_id')->constrained('schedules')->cascadeOnDelete();
            $t->foreignId('user_id')->constrained('users')->cascadeOnDelete(); // assigned worker
            $t->dateTime('start_at');             // in local TZ (store as UTC or naive? suggest UTC)
            $t->dateTime('end_at');               // = start_at + 30m normally
            $t->foreignId('job_template_id')->constrained('job_templates')->cascadeOnDelete();
            $t->string('status', 20)->default('planned'); // planned|in_progress|done|canceled
            $t->text('notes')->nullable();
            $t->timestamps();

            $t->index(['schedule_id','user_id','start_at']);
        });

        // Optional: file attachments uploaded per slot
        Schema::create('slot_attachments', function (Blueprint $t) {
            $t->id();
            $t->foreignId('schedule_slot_id')->constrained('schedule_slots')->cascadeOnDelete();
            $t->string('disk')->default('public');
            $t->string('path');                  // storage path
            $t->string('original_name');
            $t->unsignedInteger('size');         // bytes
            $t->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('slot_attachments');
        Schema::dropIfExists('schedule_slots');
        Schema::dropIfExists('schedules');
        Schema::dropIfExists('shifts');
    }
};

