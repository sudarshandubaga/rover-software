<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Firm;
use App\Models\Quotation;
use Illuminate\Http\Request;

class PublicViewController extends Controller
{
    /**
     * Display public view of a quotation.
     */
    public function showQuotation(string $token)
    {
        $quotation = Quotation::where('public_token', $token)
            ->with(['lead', 'branch', 'user'])
            ->firstOrFail();

        $firm = Firm::first();

        return view('public.quotation', [
            'quotation' => $quotation,
            'lead' => $quotation->lead,
            'firm' => $firm,
            'branch' => $quotation->branch,
        ]);
    }

    /**
     * Display public view of a booking.
     */
    public function showBooking(string $token)
    {
        $booking = Booking::where('public_token', $token)
            ->with([
                'client',
                'bookingType',
                'vehicle',
                'driver.firm',
                'firm',
                'receipts',
                'branch',
                'user',
            ])
            ->firstOrFail();

        $firm = $booking->firm ?: Firm::first();

        return view('public.booking', [
            'booking' => $booking,
            'client' => $booking->client,
            'driver' => $booking->driver,
            'vehicle' => $booking->vehicle,
            'receipts' => $booking->receipts,
            'firm' => $firm,
            'branch' => $booking->branch,
        ]);
    }

    /**
     * Return public quotation details as JSON.
     */
    public function apiQuotation(string $token)
    {
        $quotation = Quotation::where('public_token', $token)
            ->with(['lead', 'branch:id,name,city,phone,email', 'user:id,name'])
            ->firstOrFail();

        return response()->json([
            'quotation' => $quotation,
            'firm' => Firm::first(),
        ]);
    }

    /**
     * Return public booking details as JSON.
     */
    public function apiBooking(string $token)
    {
        $booking = Booking::where('public_token', $token)
            ->with([
                'client:id,name,phone,email,company_name',
                'bookingType:id,name',
                'vehicle:id,model,registration_number,seating_capacity',
                'driver:id,name,phone,license_number',
                'firm:id,name,phone,email,address,gst_number',
                'receipts',
                'branch:id,name,code,city,phone,email',
            ])
            ->firstOrFail();

        return response()->json([
            'booking' => $booking,
            'firm' => $booking->firm ?: Firm::first(),
        ]);
    }
}
