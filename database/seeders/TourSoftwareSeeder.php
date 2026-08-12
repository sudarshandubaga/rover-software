<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Firm;
use App\Models\Driver;
use App\Models\BookingType;
use App\Models\Client;
use App\Models\Vehicle;
use App\Models\Event;
use App\Models\Lead;
use App\Models\Followup;
use App\Models\Quotation;
use App\Models\Booking;
use App\Models\Receipt;
use Carbon\Carbon;

class TourSoftwareSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Seed Firms
        $firm1 = Firm::create([
            'name' => 'Swift Travels & Tours Pvt. Ltd.',
            'logo' => '',
            'address' => '102, Royal Plaza, Connaught Place, New Delhi - 110001',
            'phone' => '+91 98765 43210',
            'email' => 'info@swifttravels.com',
            'gst_number' => '07AAAAA1111A1Z1',
            'pan_number' => 'ABCDE1234F',
            'bank_name' => 'HDFC Bank Ltd.',
            'bank_account_no' => '50100200300400',
            'bank_ifsc' => 'HDFC0000001',
        ]);

        $firm2 = Firm::create([
            'name' => 'Royal Heritage Holidays',
            'logo' => '',
            'address' => 'G-5, Crystal Mall, Sawai Mansingh Road, Jaipur - 302001',
            'phone' => '+91 98123 45678',
            'email' => 'booking@royalheritage.com',
            'gst_number' => '08BBBBB2222B2Z2',
            'pan_number' => 'FGHIJ5678K',
            'bank_name' => 'State Bank of India',
            'bank_account_no' => '300100200300',
            'bank_ifsc' => 'SBIN0000123',
        ]);

        // 2. Seed Booking Types
        $bt1 = BookingType::create([
            'name' => 'Local',
            'min_km_per_day' => 80,
            'night_charge' => 250.00,
            'rate_per_km' => 12.00,
            'base_price' => 1500.00,
        ]);

        $bt2 = BookingType::create([
            'name' => 'Outstation',
            'min_km_per_day' => 250,
            'night_charge' => 350.00,
            'rate_per_km' => 14.00,
            'base_price' => 3500.00,
        ]);

        $bt3 = BookingType::create([
            'name' => 'Wedding',
            'min_km_per_day' => 100,
            'night_charge' => 500.00,
            'rate_per_km' => 25.00,
            'base_price' => 10000.00,
        ]);

        // 3. Seed Drivers
        $driver1 = Driver::create([
            'name' => 'Amit Sharma',
            'phone' => '+91 99100 12345',
            'email' => 'amit.sharma@gmail.com',
            'license_number' => 'DL-142021008888',
            'license_expiry' => '2030-12-31',
            'address' => 'House No. 45, Sector 15, Rohini, Delhi',
            'status' => 'active',
        ]);

        $driver2 = Driver::create([
            'name' => 'Rajesh Kumar',
            'phone' => '+91 98110 54321',
            'email' => 'rajesh.kumar@gmail.com',
            'license_number' => 'HR-262018009999',
            'license_expiry' => '2028-06-15',
            'address' => 'Village Silokhera, Sector 30, Gurugram',
            'status' => 'active',
        ]);

        $driver3 = Driver::create([
            'name' => 'Suresh Singh',
            'phone' => '+91 97110 67890',
            'email' => 'suresh.singh@gmail.com',
            'license_number' => 'UP-162015001111',
            'license_expiry' => '2027-03-20',
            'address' => 'Naya Bans, Sector 15, Noida',
            'status' => 'inactive',
        ]);

        // 4. Seed Clients
        $client1 = Client::create([
            'name' => 'Adani Enterprises (Attn: Karan)',
            'phone' => '+91 95600 98765',
            'email' => 'travel.desk@adani.com',
            'address' => 'Adani House, Sector 32, Gurugram',
            'company_name' => 'Adani Enterprises Ltd.',
            'gst_number' => '06AAAAA4444A1ZA',
            'department' => 'Finance Dept',
        ]);

        $client2 = Client::create([
            'name' => 'TCS Corporate (Attn: Sneha)',
            'phone' => '+91 98711 22334',
            'email' => 'admin.delhi@tcs.com',
            'address' => 'TCS House, Noida Sector 62, UP',
            'company_name' => 'Tata Consultancy Services',
            'gst_number' => '09AAAAA5555A2ZB',
            'department' => 'HR Operations',
        ]);

        $client3 = Client::create([
            'name' => 'Deepak Gupta',
            'phone' => '+91 90123 45670',
            'email' => 'deepak.gupta@outlook.com',
            'address' => 'C-4, Vasant Kunj, New Delhi',
            'company_name' => '',
            'gst_number' => '',
            'department' => '',
        ]);

        // 5. Seed Vehicles
        $vehicle1 = Vehicle::create([
            'vehicle_number' => 'DL-1CA-1234',
            'model' => 'Innova Crysta',
            'brand' => 'Toyota',
            'type' => 'SUV',
            'capacity' => 7,
            'status' => 'active',
            'rc_expiry' => '2032-05-10',
            'insurance_expiry' => '2027-08-20',
        ]);

        $vehicle2 = Vehicle::create([
            'vehicle_number' => 'DL-3CB-5678',
            'model' => 'Dzire',
            'brand' => 'Maruti Suzuki',
            'type' => 'Sedan',
            'capacity' => 5,
            'status' => 'active',
            'rc_expiry' => '2029-11-22',
            'insurance_expiry' => '2027-02-14',
        ]);

        $vehicle3 = Vehicle::create([
            'vehicle_number' => 'HR-26CL-9999',
            'model' => 'Traveller 16 Str',
            'brand' => 'Force Motors',
            'type' => 'Bus',
            'capacity' => 16,
            'status' => 'active',
            'rc_expiry' => '2035-01-01',
            'insurance_expiry' => '2027-09-30',
        ]);

        // 6. Seed Events
        Event::create([
            'title' => 'Annual Strategy Meet 2026',
            'description' => 'Corporate transport logistics for annual strategy meet involving 45 executives.',
            'venue' => 'Westin Resort, Sohna, Sohna Road, Gurugram',
            'start_date' => Carbon::today()->addDays(5)->toDateString(),
            'end_date' => Carbon::today()->addDays(7)->toDateString(),
            'budget' => 85000.00,
            'remarks' => 'Requires 3 Travellers and 2 Luxury SUVs continuously.',
        ]);

        Event::create([
            'title' => 'Sharma Family Wedding',
            'description' => 'Wedding transportation for groom side guests from Airport to Taj Palace Hotel.',
            'venue' => 'Taj Palace, New Delhi',
            'start_date' => Carbon::today()->addDays(12)->toDateString(),
            'end_date' => Carbon::today()->addDays(15)->toDateString(),
            'budget' => 120000.00,
            'remarks' => 'A luxury Mercedes E-class and 5 Sedans required.',
        ]);

        // 7. Seed Leads
        $lead1 = Lead::create([
            'client_name' => 'Vikram Malhotra',
            'phone' => '+91 99998 88877',
            'email' => 'vikram@malhotragroup.in',
            'source' => 'Website',
            'requirements' => 'Need SUV for a family trip to Agra and Jaipur from Delhi (4 days).',
            'status' => 'New',
        ]);

        $lead2 = Lead::create([
            'client_name' => 'Megha Aggarwal',
            'phone' => '+91 98989 89898',
            'email' => 'megha.aggarwal@gmail.com',
            'source' => 'Referral',
            'requirements' => 'Local full day Sedan hiring for corporate delegates visiting Noida office.',
            'status' => 'Quoted',
        ]);

        // 8. Seed Follow-ups
        Followup::create([
            'lead_id' => $lead1->id,
            'date_time' => Carbon::now()->addHours(2),
            'remarks' => 'Assigned lead to counselor. Initial call scheduled.',
            'next_followup_date' => Carbon::today()->addDay()->toDateString(),
            'status' => 'Pending',
        ]);

        Followup::create([
            'lead_id' => $lead2->id,
            'date_time' => Carbon::now()->subDay(),
            'remarks' => 'Called client. Discussed rates. Client asked for a written quotation.',
            'next_followup_date' => Carbon::today()->toDateString(),
            'status' => 'Completed',
        ]);

        // 9. Seed Quotations
        Quotation::create([
            'lead_id' => $lead2->id,
            'quotation_number' => 'QT-2026-001',
            'date' => Carbon::today()->toDateString(),
            'total_amount' => 4500.00,
            'details' => [
                ['description' => 'Local Sedan (Dzire) 80Km/8Hr Base Package', 'qty' => 1, 'rate' => 1500, 'amount' => 1500],
                ['description' => 'Estimated Extra KM (150 Km @ 12/Km)', 'qty' => 1, 'rate' => 1800, 'amount' => 1800],
                ['description' => 'Toll Tax & Parking estimate', 'qty' => 1, 'rate' => 500, 'amount' => 500],
                ['description' => 'Driver Outstation/Night Allowance', 'qty' => 1, 'rate' => 700, 'amount' => 700],
            ],
            'status' => 'Sent',
        ]);

        // 10. Seed Bookings
        // Booking 1 - Completed
        $booking1 = Booking::create([
            'client_id' => $client1->id,
            'booking_type_id' => $bt1->id, // Local
            'vehicle_id' => $vehicle1->id, // Innova
            'driver_id' => $driver1->id, // Amit
            'firm_id' => $firm1->id,
            'from_place' => 'Sector 32, Gurugram',
            'to_place' => 'IGI Airport T3, Delhi',
            'from_date_time' => Carbon::today()->subDays(5)->setHour(9)->setMinute(0)->toDateTimeString(),
            'to_date_time' => Carbon::today()->subDays(5)->setHour(17)->setMinute(0)->toDateTimeString(),
            'start_km' => 24100,
            'end_km' => 24210, // 110 KM (Local has base 80 km at 1500 base price, plus 30 extra km at 12/km = 360 rs)
            'toll_charge' => 150.00,
            'parking_charges' => [
                ['location' => 'IGI Airport Parking', 'amount' => 150.00]
            ],
            'border_taxes' => [],
            'driver_allowance' => false,
            'remarks' => 'Airport pickup and drop for CFO.',
            'department' => 'Finance Dept',
            'status' => 'Completed',
            'invoice_number' => 'INV-2026-0001',
            'invoice_date' => Carbon::today()->subDays(5)->toDateString(),
        ]);

        // Booking 2 - Active (Monthly Booking Example)
        $booking2 = Booking::create([
            'client_id' => $client2->id,
            'booking_type_id' => $bt2->id, // Outstation
            'vehicle_id' => $vehicle3->id, // Traveller
            'driver_id' => $driver2->id, // Rajesh
            'firm_id' => $firm1->id,
            'from_place' => 'Noida',
            'to_place' => 'Mussoorie & Dehradun',
            'from_date_time' => Carbon::today()->subDay()->setHour(6)->setMinute(0)->toDateTimeString(),
            'to_date_time' => Carbon::today()->addDays(2)->setHour(22)->setMinute(0)->toDateTimeString(),
            'start_km' => 10500,
            'end_km' => null, // active booking
            'toll_charge' => 750.00,
            'parking_charges' => [
                ['location' => 'Mall Road Parking', 'amount' => 300.00],
                ['location' => 'Dehradun Hotel Parking', 'amount' => 200.00]
            ],
            'border_taxes' => [
                ['state_name' => 'Uttarakhand', 'amount' => 900.00],
                ['state_name' => 'Uttar Pradesh', 'amount' => 450.00]
            ],
            'driver_allowance' => true,
            'remarks' => 'Corporate weekend team building trip.',
            'department' => 'HR Operations',
            'status' => 'Active',
            'invoice_number' => null,
            'invoice_date' => null,
        ]);

        // Booking 3 - Completed (Monthly Hiring Example)
        $booking3 = Booking::create([
            'client_id' => $client1->id,
            'booking_type_id' => $bt1->id,
            'vehicle_id' => $vehicle2->id,
            'driver_id' => $driver1->id,
            'firm_id' => $firm1->id,
            'from_place' => 'Adani Desk',
            'to_place' => 'Local NCR',
            'from_date_time' => Carbon::today()->subMonths(1)->startOfMonth()->setHour(9)->toDateTimeString(),
            'to_date_time' => Carbon::today()->subMonths(1)->endOfMonth()->setHour(18)->toDateTimeString(),
            'start_km' => 45000,
            'end_km' => 47200, // 2200 KM. Monthly hiring.
            'toll_charge' => 2500.00,
            'parking_charges' => [
                ['location' => 'Multiple Mall & Office Parking', 'amount' => 1200.00]
            ],
            'border_taxes' => [],
            'driver_allowance' => true,
            'remarks' => 'Monthly dedicated driver and vehicle contract.',
            'department' => 'Finance Dept',
            'status' => 'Completed',
            'invoice_number' => 'INV-2026-0002',
            'invoice_date' => Carbon::today()->subMonths(1)->endOfMonth()->toDateString(),
        ]);

        // 11. Seed Receipts
        Receipt::create([
            'booking_id' => $booking1->id,
            'receipt_number' => 'RCPT-2026-0001',
            'date' => Carbon::today()->subDays(5)->toDateString(),
            'amount' => 2160.00, // 1500 (base) + 360 (extra km) + 150 (toll) + 150 (parking)
            'payment_mode' => 'UPI',
            'transaction_id' => 'TXN998877665544',
            'remarks' => 'Received full payment from corporate travel desk.',
        ]);

        Receipt::create([
            'booking_id' => $booking3->id,
            'receipt_number' => 'RCPT-2026-0002',
            'date' => Carbon::today()->subMonths(1)->endOfMonth()->toDateString(),
            'amount' => 15000.00,
            'payment_mode' => 'Net Banking',
            'transaction_id' => 'NBTXN0022883344',
            'remarks' => 'Partial payment/advance for monthly contract.',
        ]);
    }
}
