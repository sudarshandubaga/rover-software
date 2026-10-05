<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use Illuminate\Http\Request;

class BranchController extends Controller
{
    /**
     * List all branches.
     */
    public function index()
    {
        $branches = Branch::withCount(['users', 'managers', 'bookings', 'leads'])
            ->orderBy('name')
            ->get();

        return response()->json($branches);
    }

    /**
     * Create a new branch (Super Admin only).
     */
    public function store(Request $request)
    {
        abort_unless($request->user()->isSuperAdmin(), 403, 'Unauthorized: Only Super Admin can create branches.');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:branches,code',
            'city' => 'nullable|string|max:100',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:30',
            'email' => 'nullable|email|max:255',
            'status' => 'required|string|in:active,inactive',
        ]);

        $branch = Branch::create($validated);
        return response()->json($branch->loadCount(['users', 'managers']), 201);
    }

    /**
     * Update an existing branch (Super Admin only).
     */
    public function update(Request $request, Branch $branch)
    {
        abort_unless($request->user()->isSuperAdmin(), 403, 'Unauthorized: Only Super Admin can update branches.');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:branches,code,' . $branch->id,
            'city' => 'nullable|string|max:100',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:30',
            'email' => 'nullable|email|max:255',
            'status' => 'required|string|in:active,inactive',
        ]);

        $branch->update($validated);
        return response()->json($branch->loadCount(['users', 'managers']));
    }

    /**
     * Delete a branch (Super Admin only).
     */
    public function destroy(Request $request, Branch $branch)
    {
        abort_unless($request->user()->isSuperAdmin(), 403, 'Unauthorized: Only Super Admin can delete branches.');

        if ($branch->users()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete branch because it has assigned managers/users. Reassign or remove them first.'
            ], 422);
        }

        $branch->delete();
        return response()->json(['message' => 'Branch deleted successfully']);
    }
}
