<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Add public_token to quotations
        if (!Schema::hasColumn('quotations', 'public_token')) {
            Schema::table('quotations', function (Blueprint $table) {
                $table->string('public_token', 64)->nullable()->index();
            });

            // Backfill existing quotations
            $quotes = DB::table('quotations')->whereNull('public_token')->get();
            foreach ($quotes as $q) {
                DB::table('quotations')->where('id', $q->id)->update([
                    'public_token' => Str::random(16),
                ]);
            }
        }

        // 2. Add public_token to bookings
        if (!Schema::hasColumn('bookings', 'public_token')) {
            Schema::table('bookings', function (Blueprint $table) {
                $table->string('public_token', 64)->nullable()->index();
            });

            // Backfill existing bookings
            $bookings = DB::table('bookings')->whereNull('public_token')->get();
            foreach ($bookings as $b) {
                DB::table('bookings')->where('id', $b->id)->update([
                    'public_token' => Str::random(16),
                ]);
            }
        }

        // 3. Create sms_logs table
        if (!Schema::hasTable('sms_logs')) {
            Schema::create('sms_logs', function (Blueprint $table) {
                $table->id();
                $table->string('recipient', 50)->index();
                $table->string('template_title', 100);
                $table->string('template_id', 100)->nullable();
                $table->text('message');
                $table->text('gateway_url')->nullable();
                $table->string('status', 30)->default('sent'); // sent, failed, logged
                $table->integer('http_code')->nullable();
                $table->text('response_body')->nullable();
                $table->unsignedBigInteger('booking_id')->nullable()->index();
                $table->unsignedBigInteger('quotation_id')->nullable()->index();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sms_logs');

        if (Schema::hasColumn('bookings', 'public_token')) {
            Schema::table('bookings', function (Blueprint $table) {
                $table->dropColumn('public_token');
            });
        }

        if (Schema::hasColumn('quotations', 'public_token')) {
            Schema::table('quotations', function (Blueprint $table) {
                $table->dropColumn('public_token');
            });
        }
    }
};
