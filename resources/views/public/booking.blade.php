<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Booking #BK-{{ $booking->id }} - Rover Rajasthan</title>
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
    
    <!-- Tailwind via CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
                        mono: ['"JetBrains Mono"', 'monospace'],
                    }
                }
            }
        }
    </script>
    
    <style>
        @media print {
            .no-print { display: none !important; }
            body { background: white !important; padding: 0 !important; }
            .print-shadow-none { box-shadow: none !important; border: 1px solid #e2e8f0 !important; }
        }
    </style>
</head>
<body class="bg-slate-100 min-h-screen font-sans text-slate-800 antialiased p-3 sm:p-6 md:p-8">

    <div class="max-w-3xl mx-auto space-y-4">

        <!-- Top Action Bar (No Print) -->
        <div class="no-print flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
            <div class="flex items-center gap-2">
                <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 font-bold text-sm">
                    RR
                </span>
                <div>
                    <h1 class="font-bold text-sm text-slate-800">Rover Rajasthan Tour Desk</h1>
                    <p class="text-xs text-slate-400">Live Journey & Booking Card</p>
                </div>
            </div>

            <div class="flex items-center gap-2">
                @if(!empty($firm?->phone))
                    <a href="tel:{{ $firm->phone }}" class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all">
                        <svg class="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                        Support Office
                    </a>
                @endif
                <button onclick="window.print()" class="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                    Print
                </button>
            </div>
        </div>

        <!-- Main Booking Card -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden print-shadow-none">

            <!-- Card Header -->
            <div class="p-6 sm:p-7 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-sm text-[11px] font-mono tracking-wider uppercase text-indigo-200 mb-1.5">
                            <span>Tour Itinerary & Pass</span>
                        </div>
                        <h2 class="text-xl sm:text-2xl font-extrabold tracking-tight">
                            Booking #BK-{{ $booking->id }}
                        </h2>
                        <p class="text-xs text-slate-300 mt-1">
                            Issued by: <strong class="text-white">{{ $firm?->name ?: 'Rover Rajasthan' }}</strong>
                            @if($branch) &bull; {{ $branch->name }} @endif
                        </p>
                    </div>

                    <div>
                        @if($booking->status === 'Completed')
                            <span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/40">
                                <span class="w-2 h-2 rounded-full bg-blue-400"></span> Completed & Billed
                            </span>
                        @elseif($booking->status === 'Active')
                            <span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Confirmed & Active
                            </span>
                        @elseif($booking->status === 'Cancelled')
                            <span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-400/40">
                                <span class="w-2 h-2 rounded-full bg-rose-400"></span> Cancelled
                            </span>
                        @else
                            <span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/40">
                                <span class="w-2 h-2 rounded-full bg-amber-400"></span> Allocation Pending
                            </span>
                        @endif
                    </div>
                </div>
            </div>

            <!-- Guest & Journey Details -->
            <div class="p-6 sm:p-7 space-y-6">

                <!-- Client Info Card -->
                <div class="bg-slate-50 p-4 rounded-xl border border-slate-200/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Passenger / Client</span>
                        <div class="text-base font-bold text-slate-800">{{ $client?->name ?: 'Valued Guest' }}</div>
                        @if(!empty($client?->company_name))
                            <div class="text-xs text-slate-500 font-medium">{{ $client->company_name }}</div>
                        @endif
                    </div>
                    @if(!empty($client?->phone))
                        <div class="text-xs text-slate-600 font-mono flex items-center gap-2">
                            <span class="px-2.5 py-1 bg-white rounded-lg border border-slate-200">
                                Contact: {{ $client->phone }}
                            </span>
                        </div>
                    @endif
                </div>

                <!-- Visual Route & Timing Section -->
                <div>
                    <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Journey Route & Dates</h3>
                    <div class="bg-gradient-to-br from-indigo-50/50 via-white to-slate-50 p-5 rounded-2xl border border-indigo-100 shadow-sm space-y-5">
                        
                        <!-- Route Line -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="flex items-start gap-3">
                                <div class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                                    FROM
                                </div>
                                <div>
                                    <div class="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Origin Place</div>
                                    <div class="text-base font-bold text-slate-800 leading-snug">{{ $booking->from_place }}</div>
                                    <div class="text-xs text-indigo-600 font-semibold mt-1">
                                        {{ $booking->from_date_time ? $booking->from_date_time->format('D, d M Y - h:i A') : 'TBD' }}
                                    </div>
                                </div>
                            </div>

                            <div class="flex items-start gap-3">
                                <div class="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                                    TO
                                </div>
                                <div>
                                    <div class="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Destination Place</div>
                                    <div class="text-base font-bold text-slate-800 leading-snug">{{ $booking->to_place }}</div>
                                    <div class="text-xs text-slate-500 font-medium mt-1">
                                        {{ $booking->to_date_time ? $booking->to_date_time->format('D, d M Y - h:i A') : 'TBD' }}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Booking Type / Notes -->
                        <div class="pt-4 border-t border-indigo-100/70 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
                            <div>
                                Duty Type: <strong class="text-slate-800">{{ $booking->bookingType?->name ?: 'Standard Tour Hire' }}</strong>
                            </div>
                            @if($booking->department)
                                <div>
                                    Dept: <strong class="text-slate-800">{{ $booking->department }}</strong>
                                </div>
                            @endif
                            @if($booking->driver_allowance)
                                <div class="text-emerald-700 font-semibold">
                                    &check; Night / Driver Allowance Included
                                </div>
                            @endif
                        </div>

                    </div>
                </div>

                <!-- Driver & Vehicle Section -->
                <div>
                    <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Vehicle & Driver Details</h3>
                    
                    @if($driver || $vehicle)
                        <div class="bg-white p-5 rounded-2xl border-2 border-indigo-200/80 shadow-sm space-y-4">
                            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div class="space-y-1">
                                    <div class="flex items-center gap-2">
                                        <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                                            Driver Allocated
                                        </span>
                                    </div>
                                    <div class="text-lg font-bold text-slate-800">
                                        {{ $driver?->name ?: 'Assigned Chauffeur' }}
                                    </div>
                                    @if(!empty($driver?->phone))
                                        <div class="text-xs text-slate-500">
                                            Phone: <strong class="text-slate-800 font-mono">{{ $driver->phone }}</strong>
                                        </div>
                                    @endif
                                </div>

                                <!-- Number Plate Badge -->
                                @php
                                    $plateNumber = $vehicle?->vehicle_number ?: ($vehicle?->registration_number ?: '');
                                @endphp
                                @if(!empty($plateNumber))
                                    <div class="inline-block bg-amber-300 text-slate-900 border-2 border-slate-900 font-mono px-3.5 py-1.5 rounded-lg text-center shadow-sm">
                                        <div class="text-[9px] uppercase tracking-widest text-slate-700 font-bold">IND &bull; VEHICLE</div>
                                        <div class="text-sm font-black tracking-widest">{{ strtoupper($plateNumber) }}</div>
                                        <div class="text-[10px] font-bold text-slate-800">{{ $vehicle->model ?: 'Tour Vehicle' }}</div>
                                    </div>
                                @endif
                            </div>

                            @if(!empty($driver?->phone))
                                <div class="pt-3 border-t border-slate-100 no-print">
                                    <a href="tel:{{ $driver->phone }}" class="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                                        Click to Call Driver ({{ $driver->phone }})
                                    </a>
                                </div>
                            @endif
                        </div>
                    @else
                        <div class="bg-amber-50/70 p-4 rounded-xl border border-amber-200/80 flex items-start gap-3 text-xs text-amber-800">
                            <svg class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            <div>
                                <strong class="font-bold">Driver Allotment in Progress:</strong>
                                <div>Our operations team is currently assigning the best vehicle and chauffeur for this trip. Driver contact details and vehicle registration will appear right here as soon as allotted.</div>
                            </div>
                        </div>
                    @endif
                </div>

                <!-- Payment & Receipts Summary -->
                <div>
                    <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Payments & Receipts Log</h3>
                    @php
                        $paidTotal = ($receipts ?: collect())->sum('amount');
                    @endphp

                    <div class="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                        @if(($receipts ?: collect())->count() > 0)
                            <div class="divide-y divide-slate-200 text-xs">
                                @foreach($receipts as $rcpt)
                                    <div class="p-3.5 flex items-center justify-between">
                                        <div>
                                            <span class="font-bold text-slate-800">Receipt #{{ $rcpt->receipt_number }}</span>
                                            <span class="text-slate-400 text-[11px] ml-2 font-mono">({{ $rcpt->payment_mode ?: 'Advance' }})</span>
                                            <div class="text-[11px] text-slate-500">{{ $rcpt->date ? date('d M Y', strtotime($rcpt->date)) : '' }}</div>
                                        </div>
                                        <div class="font-bold font-mono text-emerald-700 text-sm">
                                            ₹{{ number_format((float)$rcpt->amount, 2) }}
                                        </div>
                                    </div>
                                @endforeach
                            </div>
                            <div class="p-3.5 bg-slate-100 border-t border-slate-200 flex justify-between items-center text-xs font-bold">
                                <span>Total Paid Received:</span>
                                <span class="text-emerald-700 font-mono text-sm">₹{{ number_format((float)$paidTotal, 2) }}</span>
                            </div>
                        @else
                            <div class="p-4 text-center text-xs text-slate-400">
                                No advance payment receipts logged yet.
                            </div>
                        @endif
                    </div>
                </div>

                <!-- Trip Feedback Prompt (if Completed) -->
                @if($booking->status === 'Completed')
                    <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-200 text-center space-y-2 no-print">
                        <div class="text-lg">⭐⭐⭐⭐⭐</div>
                        <h4 class="font-bold text-sm text-slate-800">Thank you for traveling with Rover Rajasthan!</h4>
                        <p class="text-xs text-slate-600 max-w-md mx-auto">
                            We hope you had a pleasant and safe journey. We value your feedback and look forward to hosting you on your next trip!
                        </p>
                    </div>
                @endif

                <!-- Special Remarks (if any) -->
                @if(!empty($booking->remarks))
                    <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                        <span class="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">Trip Instructions / Remarks</span>
                        <p class="text-slate-700 whitespace-pre-line">{{ $booking->remarks }}</p>
                    </div>
                @endif

                <!-- Support Footer -->
                <div class="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
                    <div>Rover Rajasthan - Official Tour Booking Reference Pass</div>
                    <div>Need help? Call our office at {{ $firm?->phone ?: '+91 141 2345678' }}</div>
                </div>

            </div>
        </div>

    </div>

</body>
</html>
