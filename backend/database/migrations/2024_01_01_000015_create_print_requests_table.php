<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('print_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained('teams')->onDelete('cascade');
            $table->string('requester_email');
            $table->string('requester_name');
            $table->integer('quantity')->default(1);
            $table->date('event_date');
            $table->text('notes')->nullable();
            $table->enum('status', ['recebido', 'em_producao', 'pronto', 'entregue'])->default('recebido');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('print_requests');
    }
};
