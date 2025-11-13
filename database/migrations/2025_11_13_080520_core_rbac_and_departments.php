<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('departments', function (Blueprint $t) {
            $t->id();
            $t->string('name')->unique();
            $t->string('code')->unique();
            $t->boolean('active')->default(true);
            $t->timestamps();
        });

        Schema::create('roles', function (Blueprint $t) {
            $t->id();
            $t->string('name')->unique(); // Supervisor, Manager, Worker
            $t->timestamps();
        });

        Schema::create('user_departments', function (Blueprint $t) {
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->foreignId('department_id')->constrained()->cascadeOnDelete();
            $t->primary(['user_id','department_id']);
        });

        // Dept-scoped roles; department_id NULL for global roles (e.g., Supervisor)
        Schema::create('user_roles', function (Blueprint $t) {
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->foreignId('role_id')->constrained('roles')->cascadeOnDelete();
            $t->foreignId('department_id')->nullable()->constrained('departments')->cascadeOnDelete();
            $t->primary(['user_id','role_id','department_id']);


        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_roles');
        Schema::dropIfExists('user_departments');
        Schema::dropIfExists('roles');
        Schema::dropIfExists('departments');
    }
};
