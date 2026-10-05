<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Authenticate a user and return a Sanctum token.
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'nullable|string',
            'username' => 'nullable|string',
            'login' => 'nullable|string',
            'password' => 'required|string',
        ]);

        $loginIdentifier = $request->input('login') 
            ?? $request->input('username') 
            ?? $request->input('email');

        if (!$loginIdentifier) {
            return response()->json(['message' => 'Username or email is required'], 422);
        }

        $fieldType = filter_var($loginIdentifier, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

        $credentials = [
            $fieldType => $loginIdentifier,
            'password' => $request->input('password'),
        ];

        if (!Auth::guard('web')->attempt($credentials)) {
            return response()->json(['message' => 'Invalid credentials. Please verify your username/email and password.'], 401);
        }

        $user = Auth::guard('web')->user();

        if ($user->status && $user->status !== 'active') {
            Auth::guard('web')->logout();
            return response()->json(['message' => 'Your account is currently inactive. Please contact Super Admin.'], 403);
        }

        $token = $user->createToken('panel')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user->load('branch'),
        ]);
    }

    /**
     * Revoke the current access token.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    /**
     * Return the currently authenticated user with branch.
     */
    public function profile(Request $request)
    {
        return response()->json($request->user()->load('branch'));
    }

    /**
     * Update the authenticated user's profile (name / email / phone).
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
        ]);

        $user->update($validated);
        return response()->json($user->load('branch'));
    }

    /**
     * Change the authenticated user's password.
     */
    public function changePassword(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 422);
        }

        $user->update(['password' => Hash::make($validated['new_password'])]);
        return response()->json(['message' => 'Password updated successfully']);
    }
}
