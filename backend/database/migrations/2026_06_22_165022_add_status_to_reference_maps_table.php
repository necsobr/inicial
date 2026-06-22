<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('reference_maps', function (Blueprint $table) {
            $table->string('status')->default('recebido')->after('delivery_address');
        });
    }

    public function down(): void
    {
        Schema::table('reference_maps', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }
};
