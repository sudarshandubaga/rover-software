<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Branch;
use App\Models\Lead;
use App\Models\Booking;
use App\Models\Client;
use Illuminate\Support\Facades\Hash;
use Illuminate\Foundation\Testing\RefreshDatabase;

class RoleAndBranchScopingTest extends TestCase
{
    use RefreshDatabase;

    protected $superAdmin;
    protected $branch;
    protected $manager1;

    protected function setUp(): void
    {
        parent::setUp();

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

        $this->manager1 = User::firstOrCreate(
            ['email' => 'manager1@roverrajasthan.com'],
            [
                'name' => 'Manager One',
                'username' => 'manager1',
                'password' => Hash::make('password123'),
                'role' => 'manager',
                'branch_id' => $this->branch->id,
                'status' => 'active',
            ]
        );
    }

    public function test_login_supports_both_email_and_username(): void
    {
        // Test login by email
        $resEmail = $this->postJson('/api/login', [
            'login' => 'admin@roverrajasthan.com',
            'password' => 'password',
        ]);
        $resEmail->assertStatus(200)->assertJsonStructure(['token', 'user']);

        // Test login by username
        $resUser = $this->postJson('/api/login', [
            'login' => $this->superAdmin->username,
            'password' => 'password',
        ]);
        $resUser->assertStatus(200)->assertJsonStructure(['token', 'user']);
    }

    public function test_super_admin_can_create_manager_with_username_and_password(): void
    {
        $randomSuffix = rand(1000, 9999);
        $res = $this->actingAs($this->superAdmin, 'sanctum')->postJson('/api/users', [
            'name' => 'Test Manager ' . $randomSuffix,
            'username' => 'testmgr_' . $randomSuffix,
            'email' => 'testmgr_' . $randomSuffix . '@roverrajasthan.com',
            'password' => 'secret123',
            'role' => 'manager',
            'branch_id' => $this->branch->id,
            'phone' => '+91 99999 88888',
            'status' => 'active',
        ]);

        $res->assertStatus(201);
        $this->assertDatabaseHas('users', [
            'username' => 'testmgr_' . $randomSuffix,
            'role' => 'manager',
        ]);
    }

    public function test_manager_cannot_create_or_view_user_accounts(): void
    {
        $res = $this->actingAs($this->manager1, 'sanctum')->getJson('/api/users');
        $res->assertStatus(403);

        $resPost = $this->actingAs($this->manager1, 'sanctum')->postJson('/api/users', [
            'name' => 'Hacker User',
            'username' => 'hacker',
            'email' => 'hacker@example.com',
            'password' => '123456',
            'role' => 'manager',
            'status' => 'active'
        ]);
        $resPost->assertStatus(403);
    }

    public function test_manager_only_sees_data_added_by_him(): void
    {
        // Manager 1 creates lead
        $resLead = $this->actingAs($this->manager1, 'sanctum')->postJson('/api/leads', [
            'client_name' => 'Manager 1 Private Lead',
            'phone' => '+91 90000 11111',
            'email' => 'private@example.com',
            'status' => 'New',
        ]);
        $resLead->assertStatus(201);
        $lead1Id = $resLead->json('id');

        // Verify lead has manager1 user_id
        $this->assertEquals($this->manager1->id, $resLead->json('user_id'));

        // Query leads as Manager 1 -> should contain lead1Id
        $manager1Leads = $this->actingAs($this->manager1, 'sanctum')->getJson('/api/leads');
        $manager1Leads->assertStatus(200);
        $ids = collect($manager1Leads->json())->pluck('id');
        $this->assertTrue($ids->contains($lead1Id));

        // Create Manager 2
        $manager2 = User::create([
            'name' => 'Manager 2',
            'username' => 'mgr_two_' . rand(100, 999),
            'email' => 'mgr2_' . rand(100, 999) . '@roverrajasthan.com',
            'password' => Hash::make('password'),
            'role' => 'manager',
            'branch_id' => $this->branch->id,
            'status' => 'active',
        ]);

        // Query leads as Manager 2 -> should NOT contain lead1Id
        $manager2Leads = $this->actingAs($manager2, 'sanctum')->getJson('/api/leads');
        $manager2Leads->assertStatus(200);
        $m2Ids = collect($manager2Leads->json())->pluck('id');
        $this->assertFalse($m2Ids->contains($lead1Id));

        // Manager 2 tries to update or delete Manager 1's lead -> 403 Forbidden!
        $resForbiddenUpdate = $this->actingAs($manager2, 'sanctum')->putJson("/api/leads/{$lead1Id}", [
            'client_name' => 'Hacked Name',
            'phone' => '+91 90000 11111',
            'status' => 'New'
        ]);
        $resForbiddenUpdate->assertStatus(403);

        // Super Admin query -> SHOULD contain lead1Id (sees all data added by anyone)
        $superAdminLeads = $this->actingAs($this->superAdmin, 'sanctum')->getJson('/api/leads');
        $superAdminLeads->assertStatus(200);
        $saIds = collect($superAdminLeads->json())->pluck('id');
        $this->assertTrue($saIds->contains($lead1Id));
    }

    public function test_super_admin_can_reset_manager_password(): void
    {
        $res = $this->actingAs($this->superAdmin, 'sanctum')->putJson("/api/users/{$this->manager1->id}/password", [
            'new_password' => 'new_super_secret_pw',
        ]);
        $res->assertStatus(200);

        // Verify manager can login with new password
        $loginRes = $this->postJson('/api/login', [
            'login' => $this->manager1->username,
            'password' => 'new_super_secret_pw',
        ]);
        $loginRes->assertStatus(200);
    }

    public function test_booking_scoping_and_cross_branch_access(): void
    {
        // First create a client for manager 1
        $clientRes = $this->actingAs($this->manager1, 'sanctum')->postJson('/api/clients', [
            'name' => 'Royal Client',
            'phone' => '+91 98888 77777',
            'email' => 'client@royal.com',
            'status' => 'active',
        ]);
        $clientRes->assertStatus(201);
        $clientId = $clientRes->json('id');

        // Manager 1 creates a booking
        $bookingRes = $this->actingAs($this->manager1, 'sanctum')->postJson('/api/bookings', [
            'client_id' => $clientId,
            'from_place' => 'Jaipur Airport',
            'to_place' => 'Amer Fort',
            'from_date_time' => '2026-11-01 10:00:00',
            'to_date_time' => '2026-11-05 18:00:00',
            'driver_allowance' => true,
            'status' => 'Pending',
        ]);
        $bookingRes->assertStatus(201);
        $bookingId = $bookingRes->json('id');
        $this->assertEquals($this->manager1->id, $bookingRes->json('user_id'));
        $this->assertEquals($this->branch->id, $bookingRes->json('branch_id'));

        // Manager 2 tries to view
        $manager2 = User::create([
            'name' => 'Udaipur Manager',
            'username' => 'mgr_udr_' . rand(100, 999),
            'email' => 'mgr_udr_' . rand(100, 999) . '@roverrajasthan.com',
            'password' => Hash::make('password'),
            'role' => 'manager',
            'branch_id' => $this->branch->id,
            'status' => 'active',
        ]);

        $m2Bookings = $this->actingAs($manager2, 'sanctum')->getJson('/api/bookings');
        $m2Bookings->assertStatus(200);
        $m2Ids = collect($m2Bookings->json())->pluck('id');
        $this->assertFalse($m2Ids->contains($bookingId));

        // Manager 2 cannot update booking
        $forbiddenUpdate = $this->actingAs($manager2, 'sanctum')->putJson("/api/bookings/{$bookingId}", [
            'client_id' => $clientId,
            'from_place' => 'Hijacked Airport',
            'to_place' => 'Hijacked Fort',
            'from_date_time' => '2026-11-01 10:00:00',
            'to_date_time' => '2026-11-05 18:00:00',
            'driver_allowance' => true,
            'status' => 'Pending',
        ]);
        $forbiddenUpdate->assertStatus(403);

        // Super Admin can see booking and update it
        $saBookings = $this->actingAs($this->superAdmin, 'sanctum')->getJson('/api/bookings');
        $saBookings->assertStatus(200);
        $saIds = collect($saBookings->json())->pluck('id');
        $this->assertTrue($saIds->contains($bookingId));

        $saUpdate = $this->actingAs($this->superAdmin, 'sanctum')->putJson("/api/bookings/{$bookingId}", [
            'client_id' => $clientId,
            'from_place' => 'Jaipur Airport Terminal 2',
            'to_place' => 'Amer Fort - VIP Entrance',
            'from_date_time' => '2026-11-01 10:00:00',
            'to_date_time' => '2026-11-05 18:00:00',
            'driver_allowance' => true,
            'status' => 'Active',
        ]);
        $saUpdate->assertStatus(200);
        $this->assertEquals('Jaipur Airport Terminal 2', $saUpdate->json('from_place'));
    }
}
