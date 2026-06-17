<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sponsorship_requests', function (Blueprint $table) {
            $table->id();
            $table->string('company');
            $table->foreignId('team_id')->constrained('teams')->onDelete('cascade');
            $table->string('week');
            $table->decimal('amount', 10, 2)->default(0);
            $table->enum('status', ['aguardando_aprovacao', 'aprovada', 'recusada', 'concluida'])->default('aguardando_aprovacao');
            $table->string('applicant_email');
            $table->string('applicant_name');
            $table->date('requested_at');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sponsorship_requests');
    }
};
