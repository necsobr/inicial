<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('group_creation_requests', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('requester_name');
            $table->string('requester_email');
            $table->string('phone')->nullable();
            $table->string('company')->nullable();
            $table->string('group_name');
            $table->string('regional')->nullable();
            $table->string('city')->nullable();
            $table->date('requested_at');
            $table->enum('status', ['pendente', 'aprovada', 'recusada'])->default('pendente');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('group_creation_requests');
    }
};
