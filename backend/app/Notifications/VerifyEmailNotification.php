<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail as VerifyEmailBase;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\URL;

class VerifyEmailNotification extends VerifyEmailBase
{
    /**
     * Get the verification URL for the given notifiable.
     *
     * @param  mixed  $notifiable
     * @return string
     */
    protected function verificationUrl($notifiable)
    {
        $frontendUrl = config('app.frontend_url', 'http://localhost:3000');
        
        $signedUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(config('auth.verification.expire', 60)),
            [
                'id' => $notifiable->getKey(),
                'hash' => sha1($notifiable->getEmailForVerification()),
            ]
        );

        // We want the frontend to receive these parameters and then call the backend
        $query = parse_url($signedUrl, PHP_URL_QUERY);
        $path = parse_url($signedUrl, PHP_URL_PATH);
        
        // Extract ID and Hash from path if needed, but signed URL already has them in query usually or path
        // Standard Laravel route for verification.verify is /email/verify/{id}/{hash}
        
        return $frontendUrl . '/verify-email?' . $query . '&url=' . urlencode($signedUrl);
    }
}
