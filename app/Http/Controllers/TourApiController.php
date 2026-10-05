<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Firm;
use App\Models\Driver;
use App\Models\BookingType;
use App\Models\Department;
use App\Models\Client;
use App\Models\Vehicle;
use App\Models\Event;
use App\Models\Lead;
use App\Models\Followup;
use App\Models\Quotation;
use App\Models\Booking;
use App\Models\Receipt;
use App\Models\SmsLog;
use App\Services\SmsService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TourApiController extends Controller
{
    /**
     * Apply role-based data scoping:
     * - Managers can only see data added by them (user_id = Auth::id())
     * - Super Admins can see all data added by anyone (and optionally filter by manager_id or branch_id)
     */
    protected function applyScoping($query, Request $request)
    {
        $user = $request->user();
        if ($user && $user->isManager()) {
            $query->where('user_id', $user->id);
        } elseif ($user && $user->isSuperAdmin()) {
            if ($request->has('manager_id') && !empty($request->manager_id)) {
                $query->where('user_id', $request->manager_id);
            }
            if ($request->has('branch_id') && !empty($request->branch_id)) {
                $query->where('branch_id', $request->branch_id);
            }
        }
        return $query;
    }

    /**
     * Ensure a manager can only mutate data created by them.
     */
    protected function checkOwnership($model, Request $request, string $entityName = 'record')
    {
        $user = $request->user();
        if ($user && $user->isManager()) {
            if ($model->user_id && $model->user_id != $user->id) {
                abort(403, "Unauthorized: You can only manage {$entityName}s created by you.");
            }
        }
    }

    // ==========================================
    // DASHBOARD STATS
    // ==========================================
    public function dashboardStats(Request $request)
    {
        $user = $request->user();
        $isManager = $user && $user->isManager();

        $activeBookingsQuery = Booking::whereIn('status', ['Pending', 'Active']);
        $vehiclesQuery = Vehicle::query();
        $driversQuery = Driver::where('status', 'active');
        $leadsQuery = Lead::whereNotIn('status', ['Converted', 'Lost']);
        $receiptsQuery = Receipt::whereMonth('date', Carbon::now()->month)->whereYear('date', Carbon::now()->year);
        $trendsQuery = Booking::select(
            DB::raw('count(*) as count'),
            DB::raw("DATE_FORMAT(from_date_time, '%Y-%m') as month")
        );

        if ($isManager) {
            $activeBookingsQuery->where('user_id', $user->id);
            $vehiclesQuery->where('user_id', $user->id);
            $driversQuery->where('user_id', $user->id);
            $leadsQuery->where('user_id', $user->id);
            $receiptsQuery->where('user_id', $user->id);
            $trendsQuery->where('user_id', $user->id);

            $pendingFollowups = Followup::where('status', 'Pending')
                ->whereDate('date_time', '<=', Carbon::today())
                ->whereHas('lead', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                })
                ->count();
        } else {
            // Super Admin filters (if provided)
            if ($request->has('manager_id') && !empty($request->manager_id)) {
                $mId = $request->manager_id;
                $activeBookingsQuery->where('user_id', $mId);
                $vehiclesQuery->where('user_id', $mId);
                $driversQuery->where('user_id', $mId);
                $leadsQuery->where('user_id', $mId);
                $receiptsQuery->where('user_id', $mId);
                $trendsQuery->where('user_id', $mId);
            }
            if ($request->has('branch_id') && !empty($request->branch_id)) {
                $bId = $request->branch_id;
                $activeBookingsQuery->where('branch_id', $bId);
                $vehiclesQuery->where('branch_id', $bId);
                $driversQuery->where('branch_id', $bId);
                $leadsQuery->where('branch_id', $bId);
            }

            $pendingFollowups = Followup::where('status', 'Pending')
                ->whereDate('date_time', '<=', Carbon::today())
                ->count();
        }

        $activeBookings = $activeBookingsQuery->count();
        $totalVehicles = $vehiclesQuery->count();
        $activeDrivers = $driversQuery->count();
        $openLeads = $leadsQuery->count();
        $currentMonthReceipts = $receiptsQuery->sum('amount');
        $bookingTrends = $trendsQuery->groupBy('month')->orderBy('month', 'desc')->limit(6)->get();

        return response()->json([
            'active_bookings' => $activeBookings,
            'total_vehicles' => $totalVehicles,
            'active_drivers' => $activeDrivers,
            'open_leads' => $openLeads,
            'pending_followups' => $pendingFollowups,
            'monthly_revenue' => $currentMonthReceipts,
            'booking_trends' => $bookingTrends
        ]);
    }

    // ==========================================
    // FIRM CRUD
    // ==========================================
    public function getFirms()
    {
        return response()->json(Firm::orderBy('name')->get());
    }

    public function storeFirm(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'logo' => 'nullable|string',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'gst_number' => 'nullable|string|max:30',
            'pan_number' => 'nullable|string|max:30',
            'bank_name' => 'nullable|string|max:100',
            'bank_account_no' => 'nullable|string|max:50',
            'bank_ifsc' => 'nullable|string|max:30',
        ]);

        $firm = Firm::create($validated);
        return response()->json($firm, 201);
    }

    public function updateFirm(Request $request, Firm $firm)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'logo' => 'nullable|string',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'gst_number' => 'nullable|string|max:30',
            'pan_number' => 'nullable|string|max:30',
            'bank_name' => 'nullable|string|max:100',
            'bank_account_no' => 'nullable|string|max:50',
            'bank_ifsc' => 'nullable|string|max:30',
        ]);

        $firm->update($validated);
        return response()->json($firm);
    }

    public function destroyFirm(Firm $firm)
    {
        $firm->delete();
        return response()->json(['message' => 'Firm deleted successfully']);
    }

    // ==========================================
    // DRIVER CRUD
    // ==========================================
    public function getDrivers(Request $request)
    {
        $query = Driver::with(['firm', 'user:id,name,username', 'branch:id,name,code']);
        $this->applyScoping($query, $request);
        return response()->json($query->orderBy('name')->get());
    }

    public function storeDriver(Request $request)
    {
        $validated = $request->validate([
            'firm_id' => 'nullable|exists:firms,id',
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'license_number' => 'nullable|string|max:50',
            'license_expiry' => 'nullable|date',
            'address' => 'nullable|string',
            'status' => 'required|string|in:active,inactive',
        ]);

        $validated['user_id'] = $request->user()->id;
        $validated['branch_id'] = $request->user()->branch_id;

        $driver = Driver::create($validated);
        return response()->json($driver->load(['firm', 'user', 'branch']), 201);
    }

    public function updateDriver(Request $request, Driver $driver)
    {
        $this->checkOwnership($driver, $request, 'driver');

        $validated = $request->validate([
            'firm_id' => 'nullable|exists:firms,id',
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'license_number' => 'nullable|string|max:50',
            'license_expiry' => 'nullable|date',
            'address' => 'nullable|string',
            'status' => 'required|string|in:active,inactive',
        ]);

        $driver->update($validated);
        return response()->json($driver->load(['firm', 'user', 'branch']));
    }

    public function destroyDriver(Request $request, Driver $driver)
    {
        $this->checkOwnership($driver, $request, 'driver');
        $driver->delete();
        return response()->json(['message' => 'Driver deleted successfully']);
    }

    // ==========================================
    // CLIENT CRUD
    // ==========================================
    public function getClients(Request $request)
    {
        $query = Client::with(['user:id,name,username', 'branch:id,name,code']);
        $this->applyScoping($query, $request);
        return response()->json($query->orderBy('name')->get());
    }

    public function storeClient(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'company_name' => 'nullable|string|max:255',
            'gst_number' => 'nullable|string|max:30',
            'department' => 'nullable|string|max:255',
        ]);

        $validated['user_id'] = $request->user()->id;
        $validated['branch_id'] = $request->user()->branch_id;

        $client = Client::create($validated);
        return response()->json($client->load(['user', 'branch']), 201);
    }

    public function updateClient(Request $request, Client $client)
    {
        $this->checkOwnership($client, $request, 'client');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'company_name' => 'nullable|string|max:255',
            'gst_number' => 'nullable|string|max:30',
            'department' => 'nullable|string|max:255',
        ]);

        $client->update($validated);
        return response()->json($client->load(['user', 'branch']));
    }

    public function destroyClient(Request $request, Client $client)
    {
        $this->checkOwnership($client, $request, 'client');
        $client->delete();
        return response()->json(['message' => 'Client deleted successfully']);
    }

    // ==========================================
    // VEHICLE CRUD
    // ==========================================
    public function getVehicles(Request $request)
    {
        $query = Vehicle::with(['user:id,name,username', 'branch:id,name,code']);
        $this->applyScoping($query, $request);
        return response()->json($query->orderBy('vehicle_number')->get());
    }

    public function storeVehicle(Request $request)
    {
        $validated = $request->validate([
            'vehicle_number' => 'required|string|unique:vehicles,vehicle_number|max:30',
            'model' => 'required|string|max:255',
            'brand' => 'nullable|string|max:255',
            'type' => 'required|string|max:50',
            'capacity' => 'nullable|integer',
            'status' => 'required|string|in:active,inactive,maintenance',
            'rc_expiry' => 'nullable|date',
            'insurance_expiry' => 'nullable|date',
            'puc_expiry' => 'nullable|date',
        ]);

        $validated['user_id'] = $request->user()->id;
        $validated['branch_id'] = $request->user()->branch_id;

        $vehicle = Vehicle::create($validated);
        return response()->json($vehicle->load(['user', 'branch']), 201);
    }

    public function updateVehicle(Request $request, Vehicle $vehicle)
    {
        $this->checkOwnership($vehicle, $request, 'vehicle');

        $validated = $request->validate([
            'vehicle_number' => 'required|string|max:30|unique:vehicles,vehicle_number,' . $vehicle->id,
            'model' => 'required|string|max:255',
            'brand' => 'nullable|string|max:255',
            'type' => 'required|string|max:50',
            'capacity' => 'nullable|integer',
            'status' => 'required|string|in:active,inactive,maintenance',
            'rc_expiry' => 'nullable|date',
            'insurance_expiry' => 'nullable|date',
            'puc_expiry' => 'nullable|date',
        ]);

        $vehicle->update($validated);
        return response()->json($vehicle->load(['user', 'branch']));
    }

    public function destroyVehicle(Request $request, Vehicle $vehicle)
    {
        $this->checkOwnership($vehicle, $request, 'vehicle');
        $vehicle->delete();
        return response()->json(['message' => 'Vehicle deleted successfully']);
    }

    // ==========================================
    // EVENT CRUD
    // ==========================================
    public function getEvents(Request $request)
    {
        $query = Event::with(['user:id,name,username', 'branch:id,name,code']);
        $this->applyScoping($query, $request);
        return response()->json($query->orderBy('start_date', 'desc')->get());
    }

    public function storeEvent(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'venue' => 'nullable|string|max:255',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'budget' => 'nullable|numeric',
            'remarks' => 'nullable|string',
        ]);

        $validated['user_id'] = $request->user()->id;
        $validated['branch_id'] = $request->user()->branch_id;

        $event = Event::create($validated);
        return response()->json($event->load(['user', 'branch']), 201);
    }

    public function updateEvent(Request $request, Event $event)
    {
        $this->checkOwnership($event, $request, 'event');

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'venue' => 'nullable|string|max:255',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'budget' => 'nullable|numeric',
            'remarks' => 'nullable|string',
        ]);

        $event->update($validated);
        return response()->json($event->load(['user', 'branch']));
    }

    public function destroyEvent(Request $request, Event $event)
    {
        $this->checkOwnership($event, $request, 'event');
        $event->delete();
        return response()->json(['message' => 'Event deleted successfully']);
    }

    // ==========================================
    // BOOKING TYPE CRUD
    // ==========================================
    public function getBookingTypes()
    {
        return response()->json(BookingType::orderBy('name')->get());
    }

    public function storeBookingType(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'min_km_per_day' => 'required|integer|min:0',
            'night_charge' => 'required|numeric|min:0',
            'rate_per_km' => 'required|numeric|min:0',
            'base_price' => 'required|numeric|min:0',
        ]);

        $bookingType = BookingType::create($validated);
        return response()->json($bookingType, 201);
    }

    public function updateBookingType(Request $request, BookingType $bookingType)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'min_km_per_day' => 'required|integer|min:0',
            'night_charge' => 'required|numeric|min:0',
            'rate_per_km' => 'required|numeric|min:0',
            'base_price' => 'required|numeric|min:0',
        ]);

        $bookingType->update($validated);
        return response()->json($bookingType);
    }

    public function destroyBookingType(BookingType $bookingType)
    {
        $bookingType->delete();
        return response()->json(['message' => 'Booking type deleted successfully']);
    }

    // ==========================================
    // LEADS & FOLLOWUPS & QUOTATIONS
    // ==========================================
    public function getLeads(Request $request)
    {
        $query = Lead::with(['followups', 'quotations', 'user:id,name,username', 'branch:id,name,code']);
        $this->applyScoping($query, $request);
        return response()->json($query->orderBy('created_at', 'desc')->get());
    }

    public function storeLead(Request $request)
    {
        $validated = $request->validate([
            'client_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'source' => 'nullable|string|max:100',
            'requirements' => 'nullable|string',
            'status' => 'required|string|in:New,Contacted,Quoted,Converted,Lost',
        ]);

        $validated['user_id'] = $request->user()->id;
        $validated['branch_id'] = $request->user()->branch_id;

        $lead = Lead::create($validated);
        return response()->json($lead->load(['followups', 'quotations', 'user', 'branch']), 201);
    }

    public function updateLead(Request $request, Lead $lead)
    {
        $this->checkOwnership($lead, $request, 'lead');

        $validated = $request->validate([
            'client_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'source' => 'nullable|string|max:100',
            'requirements' => 'nullable|string',
            'status' => 'required|string|in:New,Contacted,Quoted,Converted,Lost',
        ]);

        $lead->update($validated);
        return response()->json($lead->load(['followups', 'quotations', 'user', 'branch']));
    }

    public function destroyLead(Request $request, Lead $lead)
    {
        $this->checkOwnership($lead, $request, 'lead');
        $lead->delete();
        return response()->json(['message' => 'Lead deleted successfully']);
    }

    // Followups
    public function storeFollowup(Request $request)
    {
        $lead = Lead::findOrFail($request->input('lead_id'));
        $this->checkOwnership($lead, $request, 'lead');

        $validated = $request->validate([
            'lead_id' => 'required|exists:leads,id',
            'date_time' => 'required|date',
            'remarks' => 'required|string',
            'next_followup_date' => 'nullable|date',
            'status' => 'required|string|in:Pending,Completed',
        ]);

        $followup = Followup::create($validated);
        return response()->json($followup, 201);
    }

    public function updateFollowup(Request $request, Followup $followup)
    {
        $this->checkOwnership($followup->lead, $request, 'lead');

        $validated = $request->validate([
            'date_time' => 'required|date',
            'remarks' => 'required|string',
            'next_followup_date' => 'nullable|date',
            'status' => 'required|string|in:Pending,Completed',
        ]);

        $followup->update($validated);
        return response()->json($followup);
    }

    public function destroyFollowup(Request $request, Followup $followup)
    {
        $this->checkOwnership($followup->lead, $request, 'lead');
        $followup->delete();
        return response()->json(['message' => 'Followup deleted successfully']);
    }

    // Quotations
    public function getQuotations(Request $request)
    {
        $query = Quotation::with(['lead', 'user:id,name,username', 'branch:id,name,code']);
        $this->applyScoping($query, $request);
        return response()->json($query->orderBy('date', 'desc')->get());
    }

    public function storeQuotation(Request $request)
    {
        $lead = Lead::findOrFail($request->input('lead_id'));
        $this->checkOwnership($lead, $request, 'lead');

        $validated = $request->validate([
            'lead_id' => 'required|exists:leads,id',
            'quotation_number' => 'required|string|unique:quotations,quotation_number',
            'date' => 'required|date',
            'total_amount' => 'required|numeric',
            'details' => 'required|array',
            'status' => 'required|string|in:Draft,Sent,Accepted,Rejected',
        ]);

        $validated['user_id'] = $request->user()->id;
        $validated['branch_id'] = $request->user()->branch_id;

        $quotation = Quotation::create($validated);

        // Update Lead status automatically
        if ($lead && $lead->status == 'New') {
            $lead->update(['status' => 'Quoted']);
        }

        // Auto-send SMS to customer with public quotation URL
        try {
            app(SmsService::class)->sendQuotationSms($quotation);
        } catch (\Throwable $e) {
            Log::error("Failed to dispatch quotation SMS: " . $e->getMessage());
        }

        return response()->json($quotation->load(['lead', 'user', 'branch']), 201);
    }

    public function updateQuotation(Request $request, Quotation $quotation)
    {
        $this->checkOwnership($quotation, $request, 'quotation');

        $validated = $request->validate([
            'quotation_number' => 'required|string|unique:quotations,quotation_number,' . $quotation->id,
            'date' => 'required|date',
            'total_amount' => 'required|numeric',
            'details' => 'required|array',
            'status' => 'required|string|in:Draft,Sent,Accepted,Rejected',
        ]);

        $quotation->update($validated);

        if ($validated['status'] == 'Accepted') {
            $quotation->lead->update(['status' => 'Converted']);
        } elseif ($validated['status'] == 'Rejected') {
            $quotation->lead->update(['status' => 'Lost']);
        }

        return response()->json($quotation->load(['lead', 'user', 'branch']));
    }

    public function destroyQuotation(Request $request, Quotation $quotation)
    {
        $this->checkOwnership($quotation, $request, 'quotation');
        $quotation->delete();
        return response()->json(['message' => 'Quotation deleted successfully']);
    }


    // ==========================================
    // BOOKINGS & BILLING & RECEIPTS
    // ==========================================
    public function getBookings(Request $request)
    {
        $query = Booking::with(['client', 'bookingType', 'vehicle', 'driver', 'firm', 'receipts', 'user:id,name,username', 'branch:id,name,code']);
        $this->applyScoping($query, $request);

        // Filter by month
        if ($request->has('month') && !empty($request->month)) {
            $month = Carbon::parse($request->month);
            $query->where(function ($q) use ($month) {
                $q->whereMonth('from_date_time', $month->month)
                    ->whereYear('from_date_time', $month->year);
            });
        }

        // Filter by department
        if ($request->has('department') && !empty($request->department)) {
            $query->where('department', 'like', '%' . $request->department . '%');
        }

        // Filter by client ID
        if ($request->has('client_id') && !empty($request->client_id)) {
            $query->where('client_id', $request->client_id);
        }

        return response()->json($query->orderBy('from_date_time', 'desc')->get());
    }

    public function storeBooking(Request $request)
    {
        $client_id = $request->input('client_id');

        // Check if "Add New Client" is requested on the fly
        if ($request->input('create_new_client') === true) {
            $clientVal = $request->validate([
                'new_client_name' => 'required|string|max:255',
                'new_client_phone' => 'required|string|max:20',
                'new_client_email' => 'nullable|email|max:255',
                'new_client_address' => 'nullable|string',
                'new_client_company' => 'nullable|string|max:255',
                'new_client_gst' => 'nullable|string|max:30',
                'new_client_department' => 'nullable|string|max:255',
            ]);

            $newClient = Client::create([
                'user_id' => $request->user()->id,
                'branch_id' => $request->user()->branch_id,
                'name' => $clientVal['new_client_name'],
                'phone' => $clientVal['new_client_phone'],
                'email' => $clientVal['new_client_email'],
                'address' => $clientVal['new_client_address'],
                'company_name' => $clientVal['new_client_company'],
                'gst_number' => $clientVal['new_client_gst'],
                'department' => $clientVal['new_client_department'],
            ]);
            $client_id = $newClient->id;
        }

        $validated = $request->validate([
            'booking_type_id' => 'nullable|exists:booking_types,id',
            'firm_id' => 'nullable|exists:firms,id',
            'from_place' => 'required|string|max:255',
            'to_place' => 'required|string|max:255',
            'from_date_time' => 'required|date',
            'to_date_time' => 'required|date',
            'start_km' => 'nullable|integer',
            'end_km' => 'nullable|integer',
            'toll_charge' => 'nullable|numeric',
            'parking_charges' => 'nullable|array',
            'border_taxes' => 'nullable|array',
            'driver_allowance' => 'required|boolean',
            'remarks' => 'nullable|string',
            'department' => 'nullable|string|max:255',
            'status' => 'required|string|in:Pending,Active,Completed,Cancelled',
        ]);

        $validated['client_id'] = $client_id;
        $validated['user_id'] = $request->user()->id;
        $validated['branch_id'] = $request->user()->branch_id;

        // Auto-assign department if not explicitly given, but client has one
        if (empty($validated['department'])) {
            $client = Client::find($client_id);
            if ($client && !empty($client->department)) {
                $validated['department'] = $client->department;
            } elseif ($client && !empty($client->company_name)) {
                $validated['department'] = $client->company_name;
            }
        }

        // If completed and no invoice details, create a placeholder invoice
        if ($validated['status'] == 'Completed') {
            $validated['invoice_number'] = 'INV-' . time() . '-' . rand(10, 99);
            $validated['invoice_date'] = Carbon::today()->toDateString();
        }

        $booking = Booking::create($validated);

        // Auto-send Booking Confirmation SMS with public link
        try {
            app(SmsService::class)->sendBookingConfirmationSms($booking->load('client'));
        } catch (\Throwable $e) {
            Log::error("Failed to auto-send booking confirmation SMS: " . $e->getMessage());
        }

        return response()->json($booking->load(['client', 'bookingType', 'vehicle', 'driver', 'firm', 'receipts', 'user', 'branch']), 201);
    }

    public function updateBooking(Request $request, Booking $booking)
    {
        $this->checkOwnership($booking, $request, 'booking');

        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'booking_type_id' => 'nullable|exists:booking_types,id',
            'firm_id' => 'nullable|exists:firms,id',
            'from_place' => 'required|string|max:255',
            'to_place' => 'required|string|max:255',
            'from_date_time' => 'required|date',
            'to_date_time' => 'required|date',
            'start_km' => 'nullable|integer',
            'end_km' => 'nullable|integer',
            'toll_charge' => 'nullable|numeric',
            'parking_charges' => 'nullable|array',
            'border_taxes' => 'nullable|array',
            'driver_allowance' => 'required|boolean',
            'remarks' => 'nullable|string',
            'department' => 'nullable|string|max:255',
            'status' => 'required|string|in:Pending,Active,Completed,Cancelled',
            'driver_id' => 'nullable|exists:drivers,id',
            'vehicle_id' => 'nullable|exists:vehicles,id',
            'invoice_number' => 'nullable|string',
            'invoice_date' => 'nullable|date',
        ]);

        $oldStatus = $booking->status;
        $oldDriverId = $booking->driver_id;

        // If status changing to Completed and no invoice exists, generate one
        if ($validated['status'] == 'Completed' && empty($booking->invoice_number) && empty($validated['invoice_number'])) {
            $validated['invoice_number'] = 'INV-' . time() . '-' . rand(10, 99);
            $validated['invoice_date'] = Carbon::today()->toDateString();
        }

        $booking->update($validated);

        // SMS Triggers on status & driver updates:
        // 1. Booking Completed
        if ($validated['status'] === 'Completed' && $oldStatus !== 'Completed') {
            try {
                app(SmsService::class)->sendBookingCompletedSms($booking->load('client'));
            } catch (\Throwable $e) {
                Log::error("Failed to dispatch booking complete SMS: " . $e->getMessage());
            }
        }
        // 2. Booking Confirmed / Active
        elseif ($validated['status'] === 'Active' && $oldStatus !== 'Active') {
            try {
                app(SmsService::class)->sendBookingConfirmationSms($booking->load('client'));
            } catch (\Throwable $e) {
                Log::error("Failed to dispatch booking confirmation SMS: " . $e->getMessage());
            }
        }

        // 3. Driver Allocated or Changed in updateBooking
        if (!empty($validated['driver_id']) && $validated['driver_id'] != $oldDriverId) {
            try {
                app(SmsService::class)->sendDriverAllocatedSms($booking->load(['client', 'driver', 'vehicle']));
            } catch (\Throwable $e) {
                Log::error("Failed to dispatch driver allocated SMS: " . $e->getMessage());
            }
        }

        return response()->json($booking->load(['client', 'bookingType', 'vehicle', 'driver', 'firm', 'receipts', 'user', 'branch']));
    }

    public function destroyBooking(Request $request, Booking $booking)
    {
        $this->checkOwnership($booking, $request, 'booking');
        $booking->delete();
        return response()->json(['message' => 'Booking deleted successfully']);
    }

    // Driver/Vehicle Allocation
    public function allocateDriver(Request $request, Booking $booking)
    {
        $this->checkOwnership($booking, $request, 'booking');

        $validated = $request->validate([
            'driver_id' => 'nullable|exists:drivers,id',
            'vehicle_id' => 'nullable|exists:vehicles,id',
            'status' => 'required|string|in:Pending,Active,Completed,Cancelled',
        ]);

        $oldDriverId = $booking->driver_id;
        $booking->update($validated);

        // Auto-send Driver Allocated SMS with public link
        if (!empty($validated['driver_id']) && $validated['driver_id'] != $oldDriverId) {
            try {
                app(SmsService::class)->sendDriverAllocatedSms($booking->load(['client', 'driver', 'vehicle']));
            } catch (\Throwable $e) {
                Log::error("Failed to dispatch driver allocated SMS: " . $e->getMessage());
            }
        }

        return response()->json($booking->load(['client', 'bookingType', 'driver', 'vehicle', 'user', 'branch']));
    }

    // Receipts
    public function storeReceipt(Request $request)
    {
        $booking = Booking::findOrFail($request->input('booking_id'));
        $this->checkOwnership($booking, $request, 'booking');

        $validated = $request->validate([
            'booking_id' => 'required|exists:bookings,id',
            'receipt_number' => 'required|string|unique:receipts,receipt_number',
            'date' => 'required|date',
            'amount' => 'required|numeric|min:0.01',
            'payment_mode' => 'required|string|max:50',
            'transaction_id' => 'nullable|string|max:100',
            'remarks' => 'nullable|string',
        ]);

        $validated['user_id'] = $request->user()->id;

        $receipt = Receipt::create($validated);
        return response()->json($receipt, 201);
    }

    public function destroyReceipt(Request $request, Receipt $receipt)
    {
        $this->checkOwnership($receipt->booking, $request, 'booking');
        $receipt->delete();
        return response()->json(['message' => 'Receipt deleted successfully']);
    }

    // Departments
    public function getDepartments()
    {
        return response()->json(Department::orderBy('name')->get());
    }

    public function storeDepartment(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string'
        ]);

        $department = Department::create($validated);
        return response()->json($department, 201);
    }

    public function updateDepartment(Request $request, Department $department)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string'
        ]);

        $department->update($validated);
        return response()->json($department);
    }

    public function destroyDepartment(Department $department)
    {
        $department->delete();
        return response()->json(null, 204);
    }

    // ==========================================
    // SMS DISPATCH & AUDIT ENDPOINTS
    // ==========================================

    /**
     * Dispatch Quotation SMS manually with public link.
     */
    public function sendQuotationSms(Request $request, Quotation $quotation)
    {
        $this->checkOwnership($quotation, $request, 'quotation');
        $result = app(SmsService::class)->sendQuotationSms($quotation);
        return response()->json($result);
    }

    /**
     * Dispatch Booking SMS manually (confirmation, driver_allocated, completed).
     */
    public function sendBookingSms(Request $request, Booking $booking)
    {
        $this->checkOwnership($booking, $request, 'booking');
        $type = $request->input('type', 'confirmation');

        $smsService = app(SmsService::class);
        $result = match ($type) {
            'driver_allocated' => $smsService->sendDriverAllocatedSms($booking->load(['client', 'driver', 'vehicle'])),
            'completed' => $smsService->sendBookingCompletedSms($booking->load('client')),
            default => $smsService->sendBookingConfirmationSms($booking->load('client')),
        };

        return response()->json($result);
    }

    /**
     * Retrieve SMS delivery logs.
     */
    public function getSmsLogs(Request $request)
    {
        $query = SmsLog::with(['booking', 'quotation'])->orderBy('id', 'desc');

        if ($request->has('booking_id')) {
            $query->where('booking_id', $request->booking_id);
        }
        if ($request->has('quotation_id')) {
            $query->where('quotation_id', $request->quotation_id);
        }

        return response()->json($query->take(50)->get());
    }
}

