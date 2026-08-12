<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TourApiController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SettingsController;

// Public authentication
Route::post('/login', [AuthController::class, 'login']);

// All other endpoints require a valid Sanctum token
Route::middleware('auth:sanctum')->group(function () {
    // Authentication / profile
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::put('/profile/password', [AuthController::class, 'changePassword']);

    // Settings
    Route::get('/settings/sms', [SettingsController::class, 'getSmsSettings']);
    Route::put('/settings/sms', [SettingsController::class, 'updateSmsSettings']);

    Route::get('/dashboard-stats', [TourApiController::class, 'dashboardStats']);

    // Firms CRUD
    Route::get('/firms', [TourApiController::class, 'getFirms']);
    Route::post('/firms', [TourApiController::class, 'storeFirm']);
    Route::put('/firms/{firm}', [TourApiController::class, 'updateFirm']);
    Route::delete('/firms/{firm}', [TourApiController::class, 'destroyFirm']);

    // Drivers CRUD
    Route::get('/drivers', [TourApiController::class, 'getDrivers']);
    Route::post('/drivers', [TourApiController::class, 'storeDriver']);
    Route::put('/drivers/{driver}', [TourApiController::class, 'updateDriver']);
    Route::delete('/drivers/{driver}', [TourApiController::class, 'destroyDriver']);

    // Clients CRUD
    Route::get('/clients', [TourApiController::class, 'getClients']);
    Route::post('/clients', [TourApiController::class, 'storeClient']);
    Route::put('/clients/{client}', [TourApiController::class, 'updateClient']);
    Route::delete('/clients/{client}', [TourApiController::class, 'destroyClient']);

    // Vehicles CRUD
    Route::get('/vehicles', [TourApiController::class, 'getVehicles']);
    Route::post('/vehicles', [TourApiController::class, 'storeVehicle']);
    Route::put('/vehicles/{vehicle}', [TourApiController::class, 'updateVehicle']);
    Route::delete('/vehicles/{vehicle}', [TourApiController::class, 'destroyVehicle']);

    // Events CRUD
    Route::get('/events', [TourApiController::class, 'getEvents']);
    Route::post('/events', [TourApiController::class, 'storeEvent']);
    Route::put('/events/{event}', [TourApiController::class, 'updateEvent']);
    Route::delete('/events/{event}', [TourApiController::class, 'destroyEvent']);

    // Booking Types CRUD
    Route::get('/booking-types', [TourApiController::class, 'getBookingTypes']);
    Route::post('/booking-types', [TourApiController::class, 'storeBookingType']);
    Route::put('/booking-types/{bookingType}', [TourApiController::class, 'updateBookingType']);
    Route::delete('/booking-types/{bookingType}', [TourApiController::class, 'destroyBookingType']);

    // Leads CRUD
    Route::get('/leads', [TourApiController::class, 'getLeads']);
    Route::post('/leads', [TourApiController::class, 'storeLead']);
    Route::put('/leads/{lead}', [TourApiController::class, 'updateLead']);
    Route::delete('/leads/{lead}', [TourApiController::class, 'destroyLead']);

    // Followups
    Route::post('/followups', [TourApiController::class, 'storeFollowup']);
    Route::put('/followups/{followup}', [TourApiController::class, 'updateFollowup']);
    Route::delete('/followups/{followup}', [TourApiController::class, 'destroyFollowup']);

    // Quotations
    Route::get('/quotations', [TourApiController::class, 'getQuotations']);
    Route::post('/quotations', [TourApiController::class, 'storeQuotation']);
    Route::put('/quotations/{quotation}', [TourApiController::class, 'updateQuotation']);
    Route::delete('/quotations/{quotation}', [TourApiController::class, 'destroyQuotation']);

    // Departments
    Route::get('/departments', [TourApiController::class, 'getDepartments']);
    Route::post('/departments', [TourApiController::class, 'storeDepartment']);
    Route::put('/departments/{department}', [TourApiController::class, 'updateDepartment']);
    Route::delete('/departments/{department}', [TourApiController::class, 'destroyDepartment']);

    // Bookings CRUD & Allocation
    Route::get('/bookings', [TourApiController::class, 'getBookings']);
    Route::post('/bookings', [TourApiController::class, 'storeBooking']);
    Route::put('/bookings/{booking}', [TourApiController::class, 'updateBooking']);
    Route::delete('/bookings/{booking}', [TourApiController::class, 'destroyBooking']);
    Route::put('/bookings/{booking}/allocate', [TourApiController::class, 'allocateDriver']);

    // Receipts
    Route::post('/receipts', [TourApiController::class, 'storeReceipt']);
    Route::delete('/receipts/{receipt}', [TourApiController::class, 'destroyReceipt']);
});

