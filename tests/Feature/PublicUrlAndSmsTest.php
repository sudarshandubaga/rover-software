<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Branch;
use App\Models\Client;
use App\Models\Driver;
use App\Models\Firm;
use App\Models\Lead;
use App\Models\Quotation;
use App\Models\SmsLog;
use App\Models\User;
use App\Models\Vehicle;
use App\Services\SmsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class PublicUrlAndSmsTest extends TestCase
{
    use RefreshDatabase;

    protected $superAdmin;
    protected $branch;
    protected $client;
    protected $lead;
    protected $firm;

    protected function setUp(): void
    {
        parent::setUp();

        // Fake all HTTP requests so no external network call is made during tests
        Http::fake([
            '*smsapi*' => Http::response('{"status":"success","msgid":"12345"}', 200),
            '*' => Http::response('ok', 200),
        ]);

        $this->branch = Branch::firstOrCreate(
            ['code' => 'JPR-TEST'],
            [
                'name' => 'Jaipur Test Branch',
                'city' => 'Jaipur',
                'address' => 'Test Address, Jaipur',
                'phone' => '+91 141 9999999',
                'status' => 'active',
            ]
        );

        $this->superAdmin = User::firstOrCreate(
            ['email' => 'admin@roverrajasthan.com'],
            [
                'name' => 'Super Administrator',
                'username' => 'admin',
                'password' => Hash::make('password'),
                'role' => 'super_admin',
                'branch_id' => $this->branch->id,
                'status' => 'active',
            ]
        );

        $this->firm = Firm::firstOrCreate(
            ['name' => 'Rover Rajasthan Tour Desk'],
            [
                'phone' => '+91 141 2345678',
                'email' => 'info@roverrajasthan.com',
                'address' => 'Station Road, Jaipur',
                'gst_number' => '08AAAAA0000A1Z5',
            ]
        );

        $this->client = Client::create([
            'user_id' => $this->superAdmin->id,
            'branch_id' => $this->branch->id,
            'name' => 'Rohan Sharma',
            'phone' => '+91 98290 12345',
            'email' => 'rohan@example.com',
            'status' => 'active',
        ]);

        $this->lead = Lead::create([
            'user_id' => $this->superAdmin->id,
            'branch_id' => $this->branch->id,
            'client_name' => 'Pooja Verma',
            'phone' => '+91 94140 54321',
            'email' => 'pooja@example.com',
            'status' => 'New',
        ]);
    }

    public function test_quotation_has_public_token_and_public_view(): void
    {
        $quotation = Quotation::create([
            'user_id' => $this->superAdmin->id,
            'branch_id' => $this->branch->id,
            'lead_id' => $this->lead->id,
            'quotation_number' => 'QT-TEST-001',
            'date' => '2026-10-04',
            'total_amount' => 12500,
            'details' => [
                ['description' => 'Jaipur Sightseeing Sedan', 'qty' => 1, 'rate' => 3500, 'amount' => 3500],
                ['description' => 'Pushkar Day Trip', 'qty' => 1, 'rate' => 9000, 'amount' => 9000],
            ],
            'status' => 'Draft',
        ]);

        $this->assertNotEmpty($quotation->public_token);
        $this->assertStringContainsString('/q/' . $quotation->public_token, $quotation->public_url);

        // Test public web view without auth
        $res = $this->get('/q/' . $quotation->public_token);
        $res->assertStatus(200);
        $res->assertSee('QT-TEST-001');
        $res->assertSee('Pooja Verma');
        $res->assertSee('Jaipur Sightseeing Sedan');

        // Test public API
        $resApi = $this->getJson('/api/public/quotations/' . $quotation->public_token);
        $resApi->assertStatus(200);
        $resApi->assertJsonPath('quotation.quotation_number', 'QT-TEST-001');
    }

    public function test_booking_has_public_token_and_public_view(): void
    {
        $booking = Booking::create([
            'user_id' => $this->superAdmin->id,
            'branch_id' => $this->branch->id,
            'client_id' => $this->client->id,
            'from_place' => 'Jaipur Railway Station',
            'to_place' => 'Udaipur City Palace',
            'from_date_time' => '2026-11-10 08:00:00',
            'to_date_time' => '2026-11-12 20:00:00',
            'driver_allowance' => true,
            'status' => 'Pending',
        ]);

        $this->assertNotEmpty($booking->public_token);
        $this->assertStringContainsString('/b/' . $booking->public_token, $booking->public_url);

        // Test public web view without auth
        $res = $this->get('/b/' . $booking->public_token);
        $res->assertStatus(200);
        $res->assertSee('Booking #BK-' . $booking->id);
        $res->assertSee('Jaipur Railway Station');
        $res->assertSee('Udaipur City Palace');
        $res->assertSee('Rohan Sharma');

        // Test public API
        $resApi = $this->getJson('/api/public/bookings/' . $booking->public_token);
        $resApi->assertStatus(200);
        $resApi->assertJsonPath('booking.from_place', 'Jaipur Railway Station');
    }

    public function test_creating_quotation_auto_dispatches_sms(): void
    {
        $res = $this->actingAs($this->superAdmin, 'sanctum')->postJson('/api/quotations', [
            'lead_id' => $this->lead->id,
            'quotation_number' => 'QT-AUTO-SMS-01',
            'date' => '2026-10-04',
            'total_amount' => 8500,
            'details' => [
                ['description' => 'Local Full Day Tour', 'qty' => 1, 'rate' => 8500, 'amount' => 8500],
            ],
            'status' => 'Draft',
        ]);
        $res->assertStatus(201);
        $quoteId = $res->json('id');

        // Check SmsLog table
        $log = SmsLog::where('quotation_id', $quoteId)->latest()->first();
        $this->assertNotNull($log, 'SMS Log should exist for created quotation');
        $this->assertEquals('Quotation', $log->template_title);
        $this->assertEquals('9414054321', $log->recipient);
        $this->assertStringContainsString('Pooja Verma', $log->message);
        $this->assertStringContainsString('QT-AUTO-SMS-01', $log->message);
        $this->assertStringContainsString('/q/', $log->message);
    }

    public function test_creating_booking_auto_dispatches_confirmation_sms(): void
    {
        $res = $this->actingAs($this->superAdmin, 'sanctum')->postJson('/api/bookings', [
            'client_id' => $this->client->id,
            'from_place' => 'Jaipur Airport',
            'to_place' => 'Jodhpur Mehrangarh',
            'from_date_time' => '2026-11-15 09:00:00',
            'to_date_time' => '2026-11-17 19:00:00',
            'driver_allowance' => true,
            'status' => 'Active',
        ]);
        $res->assertStatus(201);
        $bookingId = $res->json('id');

        // Check SmsLog table
        $log = SmsLog::where('booking_id', $bookingId)
            ->where('template_title', 'Booking Confirmations')
            ->first();
        $this->assertNotNull($log, 'Confirmation SMS should be logged');
        $this->assertEquals('9829012345', $log->recipient);
        $this->assertStringContainsString('Rohan Sharma', $log->message);
        $this->assertStringContainsString('BK-' . $bookingId, $log->message);
        $this->assertStringContainsString('/b/', $log->message);
    }

    public function test_allocating_driver_dispatches_driver_allocated_sms(): void
    {
        $booking = Booking::create([
            'user_id' => $this->superAdmin->id,
            'branch_id' => $this->branch->id,
            'client_id' => $this->client->id,
            'from_place' => 'Jaipur',
            'to_place' => 'Jaisalmer',
            'from_date_time' => '2026-12-01 06:00:00',
            'to_date_time' => '2026-12-05 22:00:00',
            'driver_allowance' => true,
            'status' => 'Pending',
        ]);

        $driver = Driver::create([
            'user_id' => $this->superAdmin->id,
            'branch_id' => $this->branch->id,
            'name' => 'Mukesh Chauffeur',
            'phone' => '+91 99887 76655',
            'status' => 'active',
        ]);

        $vehicle = Vehicle::create([
            'user_id' => $this->superAdmin->id,
            'branch_id' => $this->branch->id,
            'model' => 'Innova Crysta',
            'type' => 'SUV',
            'vehicle_number' => 'RJ-14-TA-9999',
            'status' => 'active',
        ]);

        $res = $this->actingAs($this->superAdmin, 'sanctum')->putJson("/api/bookings/{$booking->id}/allocate", [
            'driver_id' => $driver->id,
            'vehicle_id' => $vehicle->id,
            'status' => 'Active',
        ]);
        $res->assertStatus(200);

        // Check SmsLog table
        $log = SmsLog::where('booking_id', $booking->id)
            ->where('template_title', 'Driver Allocated')
            ->first();
        $this->assertNotNull($log, 'Driver Allocated SMS should be logged');
        $this->assertEquals('9829012345', $log->recipient);
        $this->assertStringContainsString('vehicle and driver have been allotted', $log->message);
        $this->assertStringContainsString('/b/' . $booking->public_token, $log->message);
    }

    public function test_completing_booking_dispatches_booking_complete_sms(): void
    {
        $booking = Booking::create([
            'user_id' => $this->superAdmin->id,
            'branch_id' => $this->branch->id,
            'client_id' => $this->client->id,
            'from_place' => 'Jaipur',
            'to_place' => 'Ajmer',
            'from_date_time' => '2026-10-01 08:00:00',
            'to_date_time' => '2026-10-01 20:00:00',
            'driver_allowance' => false,
            'status' => 'Active',
        ]);

        $res = $this->actingAs($this->superAdmin, 'sanctum')->putJson("/api/bookings/{$booking->id}", [
            'client_id' => $this->client->id,
            'from_place' => 'Jaipur',
            'to_place' => 'Ajmer',
            'from_date_time' => '2026-10-01 08:00:00',
            'to_date_time' => '2026-10-01 20:00:00',
            'driver_allowance' => false,
            'status' => 'Completed',
        ]);
        $res->assertStatus(200);

        // Check SmsLog table
        $log = SmsLog::where('booking_id', $booking->id)
            ->where('template_title', 'Booking Complete')
            ->first();
        $this->assertNotNull($log, 'Booking Complete SMS should be logged');
        $this->assertEquals('9829012345', $log->recipient);
        $this->assertStringContainsString('has been completed', $log->message);
        $this->assertStringContainsString('/b/' . $booking->public_token, $log->message);
    }
}
