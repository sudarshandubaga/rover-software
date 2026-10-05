<?php

use App\Http\Controllers\PublicViewController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Public links for SMS sharing
Route::get('/q/{token}', [PublicViewController::class, 'showQuotation'])->name('public.quotation');
Route::get('/view/quotation/{token}', [PublicViewController::class, 'showQuotation']);

Route::get('/b/{token}', [PublicViewController::class, 'showBooking'])->name('public.booking');
Route::get('/view/booking/{token}', [PublicViewController::class, 'showBooking']);

