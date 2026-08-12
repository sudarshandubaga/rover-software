<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    /**
     * Return the SMS gateway settings (with defaults).
     */
    public function getSmsSettings()
    {
        $settings = Setting::getJson('sms', []);

        return response()->json(array_merge([
            'provider' => '',
            'sender_id' => '',
            'api_key' => '',
            'api_secret' => '',
            'route' => 'transactional',
            'url' => '',
            'enabled' => false,
        ], $settings));
    }

    /**
     * Save the SMS gateway settings.
     */
    public function updateSmsSettings(Request $request)
    {
        $validated = $request->validate([
            'provider' => 'required|string|max:100',
            'sender_id' => 'nullable|string|max:30',
            'api_key' => 'nullable|string|max:255',
            'api_secret' => 'nullable|string|max:255',
            'route' => 'nullable|string|max:50',
            'url' => 'nullable|string|max:500',
            'enabled' => 'boolean',
        ]);

        Setting::updateOrCreate(
            ['key' => 'sms'],
            ['value' => json_encode($validated)]
        );

        return response()->json($validated);
    }
}
