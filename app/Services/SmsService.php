<?php

namespace App\Services;

use App\Http\Controllers\SettingsController;
use App\Models\Booking;
use App\Models\Quotation;
use App\Models\Setting;
use App\Models\SmsLog;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsService
{
    /**
     * Standard fallback gateway URL if none configured in settings.
     */
    public const DEFAULT_GATEWAY_URL = 'https://smsweb.smsleases.com/app/smsapi/index.php?key=569AA885995E9C&campaign=0&routeid=9&type=text&contacts=[MobileNo]&senderid=ROVRAJ&msg=[Message]&template_id=[TemplateID]';

    /**
     * Send Quotation SMS to customer when quotation is created or shared.
     */
    public function sendQuotationSms(Quotation $quotation): array
    {
        $lead = $quotation->lead;
        $phone = $lead?->phone;
        $customerName = $lead?->client_name ?: 'Valued Customer';
        $quoteNumber = $quotation->quotation_number;
        $publicUrl = $quotation->public_url;

        if (empty($phone)) {
            Log::warning("Cannot send quotation SMS: Lead phone is empty for Quotation #{$quoteNumber}");
            return ['success' => false, 'error' => 'Customer phone number is missing.'];
        }

        return $this->sendTemplateSms(
            templateTitle: 'Quotation',
            rawPhone: $phone,
            variables: [$customerName, $quoteNumber, $publicUrl],
            quotationId: $quotation->id
        );
    }

    /**
     * Send Booking Confirmation SMS to customer when booking is confirmed/created.
     */
    public function sendBookingConfirmationSms(Booking $booking): array
    {
        $client = $booking->client;
        $phone = $client?->phone;
        $customerName = $client?->name ?: 'Valued Guest';
        $bookingRef = 'BK-' . $booking->id;
        $publicUrl = $booking->public_url;

        if (empty($phone)) {
            Log::warning("Cannot send booking confirmation SMS: Client phone is empty for Booking #{$booking->id}");
            return ['success' => false, 'error' => 'Client phone number is missing.'];
        }

        return $this->sendTemplateSms(
            templateTitle: 'Booking Confirmations',
            rawPhone: $phone,
            variables: [$customerName, $bookingRef, $publicUrl],
            bookingId: $booking->id
        );
    }

    /**
     * Send Driver Allocation SMS to customer when vehicle and driver are allotted.
     */
    public function sendDriverAllocatedSms(Booking $booking): array
    {
        $client = $booking->client;
        $phone = $client?->phone;
        $customerName = $client?->name ?: 'Valued Guest';
        $bookingRef = 'BK-' . $booking->id;
        $publicUrl = $booking->public_url;

        if (empty($phone)) {
            Log::warning("Cannot send driver allocation SMS: Client phone is empty for Booking #{$booking->id}");
            return ['success' => false, 'error' => 'Client phone number is missing.'];
        }

        return $this->sendTemplateSms(
            templateTitle: 'Driver Allocated',
            rawPhone: $phone,
            variables: [$customerName, $bookingRef, $publicUrl],
            bookingId: $booking->id
        );
    }

    /**
     * Send Booking Complete SMS to customer when trip finishes and feedback link is shared.
     */
    public function sendBookingCompletedSms(Booking $booking): array
    {
        $client = $booking->client;
        $phone = $client?->phone;
        $customerName = $client?->name ?: 'Valued Guest';
        $bookingRef = 'BK-' . $booking->id;
        $publicUrl = $booking->public_url;

        if (empty($phone)) {
            Log::warning("Cannot send booking completed SMS: Client phone is empty for Booking #{$booking->id}");
            return ['success' => false, 'error' => 'Client phone number is missing.'];
        }

        return $this->sendTemplateSms(
            templateTitle: 'Booking Complete',
            rawPhone: $phone,
            variables: [$customerName, $bookingRef, $publicUrl],
            bookingId: $booking->id
        );
    }

    /**
     * Core dispatch engine: prepares variables, fills template, calls gateway and logs.
     */
    public function sendTemplateSms(
        string $templateTitle,
        string $rawPhone,
        array $variables,
        ?int $bookingId = null,
        ?int $quotationId = null
    ): array {
        // 1. Sanitize phone number
        $cleanPhone = $this->sanitizePhone($rawPhone);
        if (strlen($cleanPhone) < 10) {
            SmsLog::create([
                'recipient' => $rawPhone,
                'template_title' => $templateTitle,
                'message' => 'Failed: Invalid phone number',
                'status' => 'failed',
                'response_body' => "Phone number '{$rawPhone}' has less than 10 digits.",
                'booking_id' => $bookingId,
                'quotation_id' => $quotationId,
            ]);

            return ['success' => false, 'error' => "Invalid phone number: {$rawPhone}"];
        }

        // 2. Fetch and find matching template
        $templates = Setting::getJson('sms_templates', SettingsController::defaultSmsTemplates());
        $matched = null;

        foreach ($templates as $tpl) {
            if (strcasecmp(trim($tpl['title']), trim($templateTitle)) === 0) {
                $matched = $tpl;
                break;
            }
        }

        // Fallback to default templates if user removed or renamed
        if (!$matched) {
            foreach (SettingsController::defaultSmsTemplates() as $tpl) {
                if (strcasecmp(trim($tpl['title']), trim($templateTitle)) === 0) {
                    $matched = $tpl;
                    break;
                }
            }
        }

        if (!$matched) {
            return ['success' => false, 'error' => "SMS template not found for: {$templateTitle}"];
        }

        $templateId = $matched['template_id'] ?? '';
        $rawMessage = $matched['message'] ?? '';

        // 3. Fill sequential placeholders {#alp#} or {#var#}
        $finalMessage = $this->fillPlaceholders($rawMessage, $variables);

        // 4. Construct Gateway URL
        $smsConfig = Setting::getJson('sms', []);
        $gatewayUrl = !empty($smsConfig['url']) ? $smsConfig['url'] : self::DEFAULT_GATEWAY_URL;

        $targetUrl = str_replace(
            ['[MobileNo]', '[Message]', '[TemplateID]'],
            [$cleanPhone, rawurlencode($finalMessage), $templateId],
            $gatewayUrl
        );

        $safeUrlForLog = preg_replace('/key=[^&]+/', 'key=***', $targetUrl);

        // 5. Dispatch HTTP GET request to gateway
        try {
            $response = Http::timeout(10)->get($targetUrl);
            $httpCode = $response->status();
            $body = $response->body();
            $isSuccess = $response->successful();

            $log = SmsLog::create([
                'recipient' => $cleanPhone,
                'template_title' => $templateTitle,
                'template_id' => $templateId,
                'message' => $finalMessage,
                'gateway_url' => $safeUrlForLog,
                'status' => $isSuccess ? 'sent' : 'failed',
                'http_code' => $httpCode,
                'response_body' => substr($body, 0, 1000),
                'booking_id' => $bookingId,
                'quotation_id' => $quotationId,
            ]);

            Log::info("SMS dispatched successfully to {$cleanPhone} [{$templateTitle}] (Log ID: {$log->id})");

            return [
                'success' => true,
                'log_id' => $log->id,
                'message' => $finalMessage,
                'recipient' => $cleanPhone,
                'http_code' => $httpCode,
                'response' => $body,
            ];
        } catch (\Throwable $e) {
            $log = SmsLog::create([
                'recipient' => $cleanPhone,
                'template_title' => $templateTitle,
                'template_id' => $templateId,
                'message' => $finalMessage,
                'gateway_url' => $safeUrlForLog,
                'status' => 'failed',
                'http_code' => 500,
                'response_body' => 'HTTP Exception: ' . $e->getMessage(),
                'booking_id' => $bookingId,
                'quotation_id' => $quotationId,
            ]);

            Log::error("SMS Gateway Exception to {$cleanPhone}: " . $e->getMessage());

            return [
                'success' => false,
                'error' => $e->getMessage(),
                'log_id' => $log->id,
                'message' => $finalMessage,
            ];
        }
    }

    /**
     * Replace sequential placeholders {#alp#} or {#var#} with given values.
     */
    public function fillPlaceholders(string $template, array $variables): string
    {
        $index = 0;
        return preg_replace_callback('/\{#(?:alp|var)#\}/i', function () use (&$index, $variables) {
            $val = $variables[$index] ?? '';
            $index++;
            return $val;
        }, $template);
    }

    /**
     * Normalize Indian mobile phone number into 10 clean digits.
     */
    public function sanitizePhone(?string $phone): string
    {
        if (!$phone) {
            return '';
        }

        $digits = preg_replace('/[^0-9]/', '', $phone);

        // If prefixed with 91 and total length is 12 (e.g., 919829012345)
        if (strlen($digits) === 12 && str_starts_with($digits, '91')) {
            $digits = substr($digits, 2);
        }
        // If prefixed with 0 and total length is 11 (e.g., 09829012345)
        elseif (strlen($digits) === 11 && str_starts_with($digits, '0')) {
            $digits = substr($digits, 1);
        }

        return $digits;
    }
}
