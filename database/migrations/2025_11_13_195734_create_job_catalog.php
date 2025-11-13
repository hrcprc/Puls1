<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
public function up(): void {
Schema::create('job_types', function (Blueprint $t) {
$t->id();
$t->string('name')->unique();               // e.g. Electrical, Mechanical, Cleaning
$t->string('code', 32)->unique();           // ELEC, MECH, CLEAN
$t->boolean('active')->default(true);
$t->timestamps();
});

Schema::create('job_templates', function (Blueprint $t) {
$t->id();
$t->foreignId('job_type_id')->constrained('job_types')->cascadeOnDelete();
$t->string('name');                         // e.g. “Inspect conveyor belt”
$t->string('code', 64)->unique();           // e.g. INSP_CONVEYOR
$t->unsignedSmallInteger('default_duration')->default(30); // minutes
$t->text('instructions')->nullable();       // checklist / SOP summary
$t->boolean('requires_attachment')->default(false);
$t->boolean('active')->default(true);
$t->timestamps();
});
}
public function down(): void {
Schema::dropIfExists('job_templates');
Schema::dropIfExists('job_types');
}
};
