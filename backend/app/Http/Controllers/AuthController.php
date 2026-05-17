<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserStats;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Password;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\URL;

use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    /**
     * POST /api/auth/register
     */
    public function register(Request $request)
    {
        try {
            $validated = $request->validate([
                'name'     => 'required|string|max:255',
                'email'    => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8',
            ]);

            $user = User::create([
                'name'     => $validated['name'],
                'email'    => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role'     => 'user',
            ]);

            // Bootstrap gamification stats
            UserStats::forUser((string) $user->_id);

            // Send verification email
            $user->sendEmailVerificationNotification();

            $token = $user->createToken('access_token')->plainTextToken;

            return response()->json([
                'message'       => 'User registered successfully',
                'user'          => $this->formatUser($user),
                'access_token'  => $token,
                'refresh_token' => $token, // Sanctum uses same token; alias for frontend
                'token_type'    => 'Bearer',
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation error',
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Registration error: ' . $e->getMessage(), [
                'exception' => $e,
                'request' => $request->all()
            ]);
            return response()->json([
                'message' => 'Registration failed',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * POST /api/auth/login
     */
    public function login(Request $request)
    {
        try {
            $validated = $request->validate([
                'email'    => 'required|email',
                'password' => 'required|string',
            ]);

            $user = User::where('email', $validated['email'])->first();

            if (!$user || !Hash::check($validated['password'], $user->password)) {
                return response()->json([
                    'message' => 'Invalid credentials',
                ], 401);
            }

            // Revoke previous tokens
            $user->tokens()->delete();

            $token = $user->createToken('access_token')->plainTextToken;

            return response()->json([
                'message'       => 'Login successful',
                'user'          => $this->formatUser($user),
                'access_token'  => $token,
                'refresh_token' => $token,
                'token_type'    => 'Bearer',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation error',
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Login failed',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * POST /api/auth/logout
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    /**
     * GET /api/auth/me
     */
    public function me(Request $request)
    {
        return response()->json($this->formatUser($request->user()));
    }

    /**
     * POST /api/auth/refresh
     */
    public function refresh(Request $request)
    {
        // With Sanctum, we just issue a new token
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }
            $user->tokens()->delete();
            $token = $user->createToken('access_token')->plainTextToken;

            return response()->json([
                'access_token'  => $token,
                'refresh_token' => $token,
                'token_type'    => 'Bearer',
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Token refresh failed'], 401);
        }
    }

    /**
     * GET /api/auth/google
     */
    public function googleRedirect()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    /**
     * POST /api/auth/forgot-password
     */
    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $status = Password::sendResetLink(
            $request->only('email')
        );

        return $status === Password::RESET_LINK_SENT
            ? response()->json(['message' => __($status)])
            : response()->json(['message' => __($status)], 400);
    }

    /**
     * POST /api/auth/reset-password
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password)
                ])->setRememberToken(Str::random(60));

                $user->save();

                event(new PasswordReset($user));
            }
        );

        return $status === Password::PASSWORD_RESET
            ? response()->json(['message' => __($status)])
            : response()->json(['message' => __($status)], 400);
    }

    /**
     * GET /api/auth/verify-email/{id}/{hash}
     */
    public function verifyEmail(Request $request, $id, $hash)
    {
        $user = User::findOrFail($id);

        if (!hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            return response()->json(['message' => 'Invalid verification link'], 403);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified']);
        }

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return response()->json(['message' => 'Email verified successfully']);
    }

    /**
     * POST /api/auth/email/verification-notification
     */
    public function resendVerification(Request $request)
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified']);
        }

        $request->user()->sendEmailVerificationNotification();

        return response()->json(['message' => 'Verification link sent']);
    }

    /**
     * GET /api/auth/google/callback
     */
    public function googleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
            
            $user = User::where('email', $googleUser->getEmail())->first();

            if (!$user) {
                // Create user if doesn't exist
                $user = User::create([
                    'name'      => $googleUser->getName(),
                    'email'     => $googleUser->getEmail(),
                    'password'  => Hash::make(\Illuminate\Support\Str::random(16)),
                    'role'      => 'user',
                    'avatar'    => $googleUser->getAvatar(),
                    'google_id' => $googleUser->getId(),
                ]);
                
                // Bootstrap gamification stats
                UserStats::forUser((string) $user->_id);
            }

            $token = $user->createToken('access_token')->plainTextToken;

            // Redirect back to frontend with token
            $frontendUrl = config('app.frontend_url', 'http://localhost:3000');
            return redirect()->to($frontendUrl . "/auth/google/callback?token={$token}&refresh_token={$token}");

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Google Auth callback error: ' . $e->getMessage());
            return redirect()->to(config('app.frontend_url', 'http://localhost:3000') . "/login?error=google_failed");
        }
    }

    // -------------------------------------------------------

    private function formatUser(User $user): array
    {
        return [
            'id'     => (string) $user->_id,
            'name'   => $user->name,
            'email'  => $user->email,
            'role'   => $user->role ?? 'user',
            'avatar' => $user->avatar ?? null,
        ];
    }
}
