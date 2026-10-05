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
        Schema::table('users', function (Blueprint $table) {
            $table->string('username')->nullable()->unique()->after('email');
            $table->string('role')->default('manager')->after('password'); // 'super_admin' or 'manager'
            $table->foreignId('branch_id')->nullable()->after('role')->constrained('branches')->nullOnDelete();
            $table->string('phone')->nullable()->after('branch_id');
            $table->string('status')->default('active')->after('phone'); // 'active' or 'inactive'
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['branch_id']);
            $table->dropColumn(['username', 'role', 'branch_id', 'phone', 'status']);
        });
    }
};
