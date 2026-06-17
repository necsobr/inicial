<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['membro', 'patrocinador', 'entrega', 'sistema', 'atraso', 'cargo']);
            $table->text('message');
            $table->boolean('read')->default(false);
            $table->foreignId('team_id')->nullable()->constrained('teams')->onDelete('cascade');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
