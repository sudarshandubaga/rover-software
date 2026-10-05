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
            'url' => '',
        ], $settings));
    }

    /**
     * Save the SMS gateway settings.
     */
    public function updateSmsSettings(Request $request)
    {
        $validated = $request->validate([
            'url' => 'required|string|max:500',
        ]);

        Setting::updateOrCreate(
            ['key' => 'sms'],
            ['value' => json_encode($validated)]
        );

        return response()->json($validated);
    }

    /**
     * Default SMS templates shown until the user saves their own set.
     */
    public static function defaultSmsTemplates(): array
    {
        return [
            [
                'template_id' => '1277178651877699727',
                'title' => 'Booking Complete',
                'message' => 'Dear {#alp#}, booking {#alp#} has been completed. We value your feedback. Please share your experience here: {#alp#} Thank you for choosing Rover Rajasthan.',
            ],
            [
                'template_id' => '1277178651523261418',
                'title' => 'Driver Allocated',
                'message' => 'Dear {#alp#}, vehicle and driver have been allotted for booking {#alp#}. View vehicle, driver and trip details here: {#alp#}
Rover Rajasthan',
            ],
            [
                'template_id' => '1277178651736506511',
                'title' => 'Booking Confirmations',
                'message' => 'Dear {#alp#},
your booking {#alp#} has been confirmed successfully.
View your booking details here: {#alp#}
Thank you for choosing Rover Rajasthan.',
            ],
            [
                'template_id' => '1277178651651459176',
                'title' => 'Quotation',
                'message' => 'Dear {#alp#},
your quotation {#alp#}  is ready.
Please view the quotation and complete details here: {#alp#}
Thank you,
Rover Rajasthan.',
            ],
        ];
    }

    /**
     * Return the SMS message templates (with defaults).
     */
    public function getSmsTemplates()
    {
        $templates = Setting::getJson('sms_templates', self::defaultSmsTemplates());

        return response()->json($templates);
    }

    /**
     * Save the SMS message templates.
     */
    public function updateSmsTemplates(Request $request)
    {
        $validated = $request->validate([
            'templates' => 'required|array',
            'templates.*.template_id' => 'required|string|max:100',
            'templates.*.title' => 'required|string|max:200',
            'templates.*.message' => 'required|string|max:2000',
        ]);

        Setting::updateOrCreate(
            ['key' => 'sms_templates'],
            ['value' => json_encode($validated['templates'])]
        );

        return response()->json($validated['templates']);
    }
}
