<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * List all users and managers (Super Admin only).
     */
    public function index(Request $request)
    {
        abort_unless($request->user()->isSuperAdmin(), 403, 'Unauthorized: Only Super Admin can view users.');

        $query = User::with('branch')
            ->withCount(['leads', 'bookings', 'quotations'])
            ->orderBy('created_at', 'desc');

        if ($request->has('role') && !empty($request->role)) {
            $query->where('role', $request->role);
        }

        if ($request->has('branch_id') && !empty($request->branch_id)) {
            $query->where('branch_id', $request->branch_id);
        }

        return response()->json($query->get());
    }

    /**
     * Create a new manager or user (Super Admin only).
     */
    public function store(Request $request)
    {
        abort_unless($request->user()->isSuperAdmin(), 403, 'Unauthorized: Only Super Admin can create users.');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:50|alpha_dash|unique:users,username',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => ['required', Rule::in(['super_admin', 'manager'])],
            'branch_id' => 'nullable|exists:branches,id',
            'phone' => 'nullable|string|max:30',
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ]);

        $validated['password'] = Hash::make($validated['password']);

        $user = User::create($validated);

        return response()->json($user->load('branch')->loadCount(['leads', 'bookings', 'quotations']), 201);
    }

    /**
     * Update an existing user or manager (Super Admin only).
     */
    public function update(Request $request, User $user)
    {
        abort_unless($request->user()->isSuperAdmin(), 403, 'Unauthorized: Only Super Admin can update users.');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'username' => ['required', 'string', 'max:50', 'alpha_dash', Rule::unique('users', 'username')->ignore($user->id)],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => 'nullable|string|min:6',
            'role' => ['required', Rule::in(['super_admin', 'manager'])],
            'branch_id' => 'nullable|exists:branches,id',
            'phone' => 'nullable|string|max:30',
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return response()->json($user->load('branch')->loadCount(['leads', 'bookings', 'quotations']));
    }

    /**
     * Reset a manager's password (Super Admin only).
     */
    public function resetPassword(Request $request, User $user)
    {
        abort_unless($request->user()->isSuperAdmin(), 403, 'Unauthorized: Only Super Admin can reset user passwords.');

        $validated = $request->validate([
            'new_password' => 'required|string|min:6',
        ]);

        $user->update([
            'password' => Hash::make($validated['new_password']),
        ]);

        return response()->json(['message' => "Password reset successfully for user: {$user->username}"]);
    }

    /**
     * Delete a manager or user (Super Admin only).
     */
    public function destroy(Request $request, User $user)
    {
        abort_unless($request->user()->isSuperAdmin(), 403, 'Unauthorized: Only Super Admin can delete users.');

        if ($request->user()->id === $user->id) {
            return response()->json(['message' => 'You cannot delete your own account.'], 422);
        }

        $user->delete();
        return response()->json(['message' => 'User deleted successfully']);
    }
}
