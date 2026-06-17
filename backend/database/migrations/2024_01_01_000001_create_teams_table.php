<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teams', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('regional')->nullable();
            $table->string('city')->nullable();
            $table->integer('total_members')->default(0);
            $table->integer('internal_refs')->default(0);
            $table->integer('external_refs')->default(0);
            $table->integer('meetings_1a1')->default(0);
            $table->integer('guests')->default(0);
            $table->integer('education')->default(0);
            $table->decimal('total_business', 15, 2)->default(0);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teams');
    }
};
