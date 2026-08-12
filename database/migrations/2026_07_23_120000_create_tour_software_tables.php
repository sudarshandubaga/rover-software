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
        // 0. Firms
        Schema::create('firms', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('logo')->nullable();
            $table->text('address')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('gst_number')->nullable();
            $table->string('pan_number')->nullable();
            $table->string('bank_name')->nullable();
            $table->string('bank_account_no')->nullable();
            $table->string('bank_ifsc')->nullable();
            $table->timestamps();
        });

        // 1. Drivers
        Schema::create('drivers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('phone');
            $table->string('email')->nullable();
            $table->string('license_number')->nullable();
            $table->date('license_expiry')->nullable();
            $table->text('address')->nullable();
            $table->string('status')->default('active'); // active, inactive
            $table->timestamps();
        });

        // 7. Booking Types
        Schema::create('booking_types', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Local, Outstation, Wedding, etc.
            $table->integer('min_km_per_day')->default(0);
            $table->decimal('night_charge', 10, 2)->default(0.00);
            $table->decimal('rate_per_km', 10, 2)->default(0.00);
            $table->decimal('base_price', 10, 2)->default(0.00);
            $table->timestamps();
        });

        // 3. Clients
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('phone');
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->string('company_name')->nullable();
            $table->string('gst_number')->nullable();
            $table->string('department')->nullable();
            $table->timestamps();
        });

        // 5. Vehicles
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->string('vehicle_number')->unique();
            $table->string('model');
            $table->string('brand')->nullable();
            $table->string('type'); // SUV, Sedan, Hatchback, Bus
            $table->integer('capacity')->nullable();
            $table->string('status')->default('active'); // active, inactive, maintenance
            $table->date('rc_expiry')->nullable();
            $table->date('insurance_expiry')->nullable();
            $table->timestamps();
        });

        // 6. Events
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('venue')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->decimal('budget', 10, 2)->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();
        });

        // 2. Leads
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->string('client_name');
            $table->string('phone');
            $table->string('email')->nullable();
            $table->string('source')->nullable(); // Website, Referral, Cold Call
            $table->text('requirements')->nullable();
            $table->string('status')->default('New'); // New, Contacted, Quoted, Converted, Lost
            $table->timestamps();
        });

        // Leads Follow-ups
        Schema::create('followups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lead_id')->constrained('leads')->onDelete('cascade');
            $table->dateTime('date_time');
            $table->text('remarks');
            $table->date('next_followup_date')->nullable();
            $table->string('status')->default('Pending'); // Pending, Completed
            $table->timestamps();
        });

        // Leads Quotations
        Schema::create('quotations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lead_id')->constrained('leads')->onDelete('cascade');
            $table->string('quotation_number')->unique();
            $table->date('date');
            $table->decimal('total_amount', 10, 2);
            $table->json('details')->nullable(); // array of items: { description, qty, rate, amount }
            $table->string('status')->default('Draft'); // Draft, Sent, Accepted, Rejected
            $table->timestamps();
        });

        // 4. Booking
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('clients')->onDelete('cascade');
            $table->foreignId('booking_type_id')->nullable()->constrained('booking_types')->onDelete('set null');
            $table->foreignId('vehicle_id')->nullable()->constrained('vehicles')->onDelete('set null');
            $table->foreignId('driver_id')->nullable()->constrained('drivers')->onDelete('set null');
            $table->foreignId('firm_id')->nullable()->constrained('firms')->onDelete('set null');
            
            $table->string('from_place');
            $table->string('to_place');
            $table->dateTime('from_date_time');
            $table->dateTime('to_date_time');
            
            $table->integer('start_km')->nullable();
            $table->integer('end_km')->nullable();
            $table->decimal('toll_charge', 10, 2)->default(0.00);
            
            // Multiple parking charges with location: array of {location, amount}
            $table->json('parking_charges')->nullable();
            
            // Multiple border tax with state name: array of {state_name, amount}
            $table->json('border_taxes')->nullable();
            
            $table->boolean('driver_allowance')->default(false);
            $table->text('remarks')->nullable();
            $table->string('department')->nullable(); // for monthly hiring department wise booking
            $table->string('status')->default('Pending'); // Pending, Active, Completed, Cancelled
            
            $table->string('invoice_number')->nullable()->unique();
            $table->date('invoice_date')->nullable();
            $table->timestamps();
        });

        // Booking Receipts
        Schema::create('receipts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->onDelete('cascade');
            $table->string('receipt_number')->unique();
            $table->date('date');
            $table->decimal('amount', 10, 2);
            $table->string('payment_mode'); // Cash, UPI, Card, Net Banking
            $table->string('transaction_id')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('receipts');
        Schema::dropIfExists('bookings');
        Schema::dropIfExists('quotations');
        Schema::dropIfExists('followups');
        Schema::dropIfExists('leads');
        Schema::dropIfExists('events');
        Schema::dropIfExists('vehicles');
        Schema::dropIfExists('clients');
        Schema::dropIfExists('booking_types');
        Schema::dropIfExists('drivers');
        Schema::dropIfExists('firms');
    }
};
