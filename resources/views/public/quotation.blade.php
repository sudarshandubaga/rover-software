<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Quotation #{{ $quotation->quotation_number }} - Rover Rajasthan</title>
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
    
    <!-- Tailwind via CDN for standalone instant rendering -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
                        mono: ['"JetBrains Mono"', 'monospace'],
                    },
                    colors: {
                        brand: {
                            50: '#f5f3ff',
                            100: '#ede9fe',
                            500: '#8b5cf6',
                            600: '#7c3aed',
                            700: '#6d28d9',
                            800: '#5b21b6',
                            900: '#4c1d95',
                        }
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

    <div class="max-w-4xl mx-auto space-y-4">
        
        <!-- Top Action Bar (No Print) -->
        <div class="no-print flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
            <div class="flex items-center gap-2">
                <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 font-bold text-sm">
                    RR
                </span>
                <div>
                    <h1 class="font-bold text-sm text-slate-800">Rover Rajasthan Tour & Travels</h1>
                    <p class="text-xs text-slate-400">Official Travel Quotation Document</p>
                </div>
            </div>

            <div class="flex items-center gap-2">
                @if(!empty($firm?->phone))
                    <a href="tel:{{ $firm->phone }}" class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all">
                        <svg class="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                        Call Office
                    </a>
                @endif
                <button onclick="window.print()" class="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                    Print / Save PDF
                </button>
            </div>
        </div>

        <!-- Main Quotation Document Card -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden print-shadow-none">
            
            <!-- Document Header -->
            <div class="p-6 sm:p-8 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                    <div>
                        <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-sm text-[11px] font-mono tracking-wider uppercase text-indigo-200 mb-2">
                            <span>Quotation Document</span>
                        </div>
                        <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
                            {{ $firm?->name ?: 'Rover Rajasthan' }}
                        </h2>
                        <p class="text-xs sm:text-sm text-slate-300 mt-1 max-w-md">
                            {{ $firm?->address ?: 'Jaipur, Rajasthan, India' }}
                        </p>
                        <div class="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-2">
                            @if(!empty($firm?->phone))
                                <span>Phone: <strong class="text-white">{{ $firm->phone }}</strong></span>
                            @endif
                            @if(!empty($firm?->email))
                                <span>Email: <strong class="text-white">{{ $firm->email }}</strong></span>
                            @endif
                            @if(!empty($firm?->gst_number))
                                <span>GSTIN: <strong class="text-white font-mono">{{ $firm->gst_number }}</strong></span>
                            @endif
                        </div>
                    </div>

                    <div class="sm:text-right bg-white/5 sm:bg-transparent p-4 sm:p-0 rounded-xl border border-white/10 sm:border-0">
                        <div class="text-[11px] uppercase tracking-wider text-indigo-300 font-semibold">Quote Reference</div>
                        <div class="text-xl sm:text-2xl font-black font-mono text-white mt-0.5">
                            {{ $quotation->quotation_number }}
                        </div>
                        <div class="text-xs text-slate-300 mt-1">
                            Date: <strong class="text-white">{{ $quotation->date ? $quotation->date->format('d M, Y') : date('d M, Y') }}</strong>
                        </div>
                        <div class="mt-2">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider {{ $quotation->status === 'Accepted' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : ($quotation->status === 'Sent' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40') }}">
                                {{ $quotation->status ?: 'Draft' }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recipient & Meta Section -->
            <div class="p-6 sm:p-8 bg-slate-50/70 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                    <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Quote Prepared For:</h3>
                    <div class="text-base font-bold text-slate-800">{{ $lead?->client_name ?: 'Valued Client' }}</div>
                    @if(!empty($lead?->phone))
                        <div class="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
                            <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                            {{ $lead->phone }}
                        </div>
                    @endif
                    @if(!empty($lead?->email))
                        <div class="text-xs text-slate-600 mt-0.5 flex items-center gap-1.5">
                            <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                            {{ $lead->email }}
                        </div>
                    @endif
                </div>

                <div class="sm:text-right">
                    <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Branch / Service Desk:</h3>
                    <div class="text-sm font-semibold text-slate-800">
                        {{ $branch?->name ?: 'Jaipur Head Office' }}
                    </div>
                    @if(!empty($branch?->phone))
                        <div class="text-xs text-slate-500 mt-1">Branch Helpline: {{ $branch->phone }}</div>
                    @endif
                    <div class="text-xs text-slate-400 mt-1">
                        Validity: 15 days from issue date
                    </div>
                </div>
            </div>

            <!-- Itemized Details Table -->
            <div class="p-6 sm:p-8">
                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Trip Package & Rate Breakdown</h3>
                
                <div class="overflow-x-auto border border-slate-200 rounded-xl">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                                <th class="py-3 px-4 font-bold">#</th>
                                <th class="py-3 px-4 font-bold">Service / Description</th>
                                <th class="py-3 px-4 font-bold text-center">Qty / Days</th>
                                <th class="py-3 px-4 font-bold text-right">Rate (₹)</th>
                                <th class="py-3 px-4 font-bold text-right">Amount (₹)</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 text-sm">
                            @php
                                $details = is_string($quotation->details) ? json_decode($quotation->details, true) : ($quotation->details ?: []);
                            @endphp

                            @forelse($details as $index => $item)
                                <tr class="hover:bg-slate-50/50">
                                    <td class="py-3.5 px-4 font-mono text-xs text-slate-400">{{ $index + 1 }}</td>
                                    <td class="py-3.5 px-4 font-medium text-slate-800">
                                        {{ $item['description'] ?? 'Tour Service' }}
                                    </td>
                                    <td class="py-3.5 px-4 text-center font-mono text-slate-600">
                                        {{ $item['qty'] ?? 1 }}
                                    </td>
                                    <td class="py-3.5 px-4 text-right font-mono text-slate-600">
                                        ₹{{ number_format((float)($item['rate'] ?? 0), 2) }}
                                    </td>
                                    <td class="py-3.5 px-4 text-right font-mono font-bold text-slate-800">
                                        ₹{{ number_format((float)($item['amount'] ?? 0), 2) }}
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="5" class="py-6 text-center text-slate-400 text-sm">
                                        No itemized rows specified.
                                    </td>
                                </tr>
                            @endforelse
                        </tbody>
                        <tfoot>
                            <tr class="bg-slate-50/80 border-t-2 border-slate-200 font-bold text-base text-slate-900">
                                <td colspan="4" class="py-4 px-6 text-right uppercase tracking-wider text-xs text-slate-600">
                                    Grand Total Amount:
                                </td>
                                <td class="py-4 px-4 text-right font-mono text-indigo-700 text-lg">
                                    ₹{{ number_format((float)$quotation->total_amount, 2) }}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <!-- Terms and Bank Details Section -->
                <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                    <div>
                        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Terms & Guidelines</h4>
                        <ul class="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                            <li>Quotation includes professional vehicle hire with experienced tourist driver.</li>
                            <li>Toll tax, parking, and inter-state permit charges as per actual receipts unless included above.</li>
                            <li>Standard tourist air-conditioning guidelines apply in hilly terrains.</li>
                            <li>Booking confirmation is subject to vehicle availability at the time of advance payment.</li>
                        </ul>
                    </div>

                    @if(!empty($firm?->bank_name))
                        <div class="bg-indigo-50/60 p-4 rounded-xl border border-indigo-100">
                            <h4 class="text-xs font-bold uppercase tracking-wider text-indigo-900 mb-2">Bank Details for Advance</h4>
                            <div class="text-xs text-slate-700 space-y-1 font-mono">
                                <div><span class="text-slate-500">Bank:</span> <strong>{{ $firm->bank_name }}</strong></div>
                                <div><span class="text-slate-500">Account No:</span> <strong>{{ $firm->bank_account_no }}</strong></div>
                                <div><span class="text-slate-500">IFSC Code:</span> <strong>{{ $firm->bank_ifsc }}</strong></div>
                            </div>
                        </div>
                    @endif
                </div>

                <!-- Footer Signoff -->
                <div class="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
                    <div>Rover Rajasthan - Rajasthan Tourism & Corporate Travel Services</div>
                    <div>Computer Generated Travel Quotation</div>
                </div>

            </div>
        </div>

    </div>

</body>
</html>
