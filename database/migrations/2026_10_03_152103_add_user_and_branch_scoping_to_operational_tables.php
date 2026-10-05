<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $tablesWithBranch = ['leads', 'bookings', 'quotations', 'clients', 'drivers', 'vehicles', 'events'];

        foreach ($tablesWithBranch as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->foreignId('user_id')->nullable()->after('id')->constrained('users')->nullOnDelete();
                $table->foreignId('branch_id')->nullable()->after('user_id')->constrained('branches')->nullOnDelete();
            });
        }

        Schema::table('receipts', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('id')->constrained('users')->nullOnDelete();
        });

        // Set existing records to default admin user
        $defaultUserId = DB::table('users')->where('email', 'admin@roverrajasthan.com')->value('id')
            ?? DB::table('users')->orderBy('id')->value('id');

        if ($defaultUserId) {
            foreach ($tablesWithBranch as $tableName) {
                DB::table($tableName)->whereNull('user_id')->update(['user_id' => $defaultUserId]);
            }
            DB::table('receipts')->whereNull('user_id')->update(['user_id' => $defaultUserId]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('receipts', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn(['user_id']);
        });

        $tablesWithBranch = ['leads', 'bookings', 'quotations', 'clients', 'drivers', 'vehicles', 'events'];
        foreach ($tablesWithBranch as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->dropForeign(['user_id']);
                $table->dropForeign(['branch_id']);
                $table->dropColumn(['user_id', 'branch_id']);
            });
        }
    }
};
