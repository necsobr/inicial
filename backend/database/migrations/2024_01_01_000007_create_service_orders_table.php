<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained('teams')->onDelete('cascade');
            $table->string('paper_type');
            $table->integer('copies')->nullable();
            $table->enum('recurrence', ['semanal', 'unica']);
            $table->enum('day_of_week', ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'])->nullable();
            $table->date('single_date')->nullable();
            $table->integer('meetings_count')->default(1);
            $table->integer('sponsor_slots')->default(1);
            $table->decimal('quota_price', 10, 2)->default(0);
            $table->date('start_date');
            $table->enum('status', ['ativa', 'encerrada', 'cancelada'])->default('ativa');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_orders');
    }
};
