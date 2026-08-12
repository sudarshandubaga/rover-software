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
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class TourApiController extends Controller
{
    // ==========================================
    // DASHBOARD STATS
    // ==========================================
    public function dashboardStats()
    {
        $activeBookings = Booking::whereIn('status', ['Pending', 'Active'])->count();
        $totalVehicles = Vehicle::count();
        $activeDrivers = Driver::where('status', 'active')->count();
        $openLeads = Lead::whereNotIn('status', ['Converted', 'Lost'])->count();

        $pendingFollowups = Followup::where('status', 'Pending')
            ->whereDate('date_time', '<=', Carbon::today())
            ->count();

        // Revenue this month
        $currentMonthReceipts = Receipt::whereMonth('date', Carbon::now()->month)
            ->whereYear('date', Carbon::now()->year)
            ->sum('amount');

        // Bookings count grouped by month (last 6 months)
        $bookingTrends = Booking::select(
            DB::raw('count(*) as count'),
            DB::raw("DATE_FORMAT(from_date_time, '%Y-%m') as month")
        )
            ->groupBy('month')
            ->orderBy('month', 'desc')
            ->limit(6)
            ->get();

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
    public function getDrivers()
    {
        return response()->json(Driver::with('firm')->orderBy('name')->get());
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

        $driver = Driver::create($validated);
        return response()->json($driver, 201);
    }

    public function updateDriver(Request $request, Driver $driver)
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

        $driver->update($validated);
        return response()->json($driver);
    }

    public function destroyDriver(Driver $driver)
    {
        $driver->delete();
        return response()->json(['message' => 'Driver deleted successfully']);
    }

    // ==========================================
    // CLIENT CRUD
    // ==========================================
    public function getClients()
    {
        return response()->json(Client::orderBy('name')->get());
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

        $client = Client::create($validated);
        return response()->json($client, 201);
    }

    public function updateClient(Request $request, Client $client)
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

        $client->update($validated);
        return response()->json($client);
    }

    public function destroyClient(Client $client)
    {
        $client->delete();
        return response()->json(['message' => 'Client deleted successfully']);
    }

    // ==========================================
    // VEHICLE CRUD
    // ==========================================
    public function getVehicles()
    {
        return response()->json(Vehicle::orderBy('vehicle_number')->get());
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

        $vehicle = Vehicle::create($validated);
        return response()->json($vehicle, 201);
    }

    public function updateVehicle(Request $request, Vehicle $vehicle)
    {
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
        return response()->json($vehicle);
    }

    public function destroyVehicle(Vehicle $vehicle)
    {
        $vehicle->delete();
        return response()->json(['message' => 'Vehicle deleted successfully']);
    }

    // ==========================================
    // EVENT CRUD
    // ==========================================
    public function getEvents()
    {
        return response()->json(Event::orderBy('start_date', 'desc')->get());
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

        $event = Event::create($validated);
        return response()->json($event, 201);
    }

    public function updateEvent(Request $request, Event $event)
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

        $event->update($validated);
        return response()->json($event);
    }

    public function destroyEvent(Event $event)
    {
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
    public function getLeads()
    {
        return response()->json(Lead::with(['followups', 'quotations'])->orderBy('created_at', 'desc')->get());
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

        $lead = Lead::create($validated);
        return response()->json($lead, 201);
    }

    public function updateLead(Request $request, Lead $lead)
    {
        $validated = $request->validate([
            'client_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'source' => 'nullable|string|max:100',
            'requirements' => 'nullable|string',
            'status' => 'required|string|in:New,Contacted,Quoted,Converted,Lost',
        ]);

        $lead->update($validated);
        return response()->json($lead);
    }

    public function destroyLead(Lead $lead)
    {
        $lead->delete();
        return response()->json(['message' => 'Lead deleted successfully']);
    }

    // Followups
    public function storeFollowup(Request $request)
    {
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
        $validated = $request->validate([
            'date_time' => 'required|date',
            'remarks' => 'required|string',
            'next_followup_date' => 'nullable|date',
            'status' => 'required|string|in:Pending,Completed',
        ]);

        $followup->update($validated);
        return response()->json($followup);
    }

    public function destroyFollowup(Followup $followup)
    {
        $followup->delete();
        return response()->json(['message' => 'Followup deleted successfully']);
    }

    // Quotations
    public function getQuotations()
    {
        return response()->json(Quotation::with('lead')->orderBy('date', 'desc')->get());
    }

    public function storeQuotation(Request $request)
    {
        $validated = $request->validate([
            'lead_id' => 'required|exists:leads,id',
            'quotation_number' => 'required|string|unique:quotations,quotation_number',
            'date' => 'required|date',
            'total_amount' => 'required|numeric',
            'details' => 'required|array',
            'status' => 'required|string|in:Draft,Sent,Accepted,Rejected',
        ]);

        $quotation = Quotation::create($validated);

        // Update Lead status automatically
        $lead = Lead::find($validated['lead_id']);
        if ($lead && $lead->status == 'New') {
            $lead->update(['status' => 'Quoted']);
        }

        return response()->json($quotation, 201);
    }

    public function updateQuotation(Request $request, Quotation $quotation)
    {
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

        return response()->json($quotation);
    }

    public function destroyQuotation(Quotation $quotation)
    {
        $quotation->delete();
        return response()->json(['message' => 'Quotation deleted successfully']);
    }


    // ==========================================
    // BOOKINGS & BILLING & RECEIPTS
    // ==========================================
    public function getBookings(Request $request)
    {
        $query = Booking::with(['client', 'bookingType', 'vehicle', 'driver', 'firm', 'receipts']);

        // Filter by month
        if ($request->has('month') && !empty($request->month)) {
            // format: YYYY-MM
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
        return response()->json($booking, 201);
    }

    public function updateBooking(Request $request, Booking $booking)
    {
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
            'invoice_number' => 'nullable|string',
            'invoice_date' => 'nullable|date',
        ]);

        // If status changing to Completed and no invoice exists, generate one
        if ($validated['status'] == 'Completed' && empty($booking->invoice_number) && empty($validated['invoice_number'])) {
            $validated['invoice_number'] = 'INV-' . time() . '-' . rand(10, 99);
            $validated['invoice_date'] = Carbon::today()->toDateString();
        }

        $booking->update($validated);
        return response()->json($booking);
    }

    public function destroyBooking(Booking $booking)
    {
        $booking->delete();
        return response()->json(['message' => 'Booking deleted successfully']);
    }

    // Driver/Vehicle Allocation
    public function allocateDriver(Request $request, Booking $booking)
    {
        $validated = $request->validate([
            'driver_id' => 'nullable|exists:drivers,id',
            'vehicle_id' => 'nullable|exists:vehicles,id',
            'status' => 'required|string|in:Pending,Active,Completed,Cancelled',
        ]);

        $booking->update($validated);
        return response()->json($booking->load(['driver', 'vehicle']));
    }

    // Receipts
    public function storeReceipt(Request $request)
    {
        $validated = $request->validate([
            'booking_id' => 'required|exists:bookings,id',
            'receipt_number' => 'required|string|unique:receipts,receipt_number',
            'date' => 'required|date',
            'amount' => 'required|numeric|min:0.01',
            'payment_mode' => 'required|string|max:50',
            'transaction_id' => 'nullable|string|max:100',
            'remarks' => 'nullable|string',
        ]);

        $receipt = Receipt::create($validated);
        return response()->json($receipt, 201);
    }

    public function destroyReceipt(Receipt $receipt)
    {
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
}
