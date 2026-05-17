<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ProfileController extends Controller
{
    /**
     * Update user profile data
     */
    public function update(Request $request)
    {
        $user = $request->user();
        
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->_id,
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user->update($request->only(['name', 'email']));

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user
        ]);
    }

    /**
     * Upload or update profile avatar
     */
    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $user = $request->user();

        // Delete old avatar if exists
        if ($user->avatar) {
            $oldPath = str_replace(url('storage/'), '', $user->avatar);
            Storage::disk('public')->delete($oldPath);
        }

        // Store new avatar
        $path = $request->file('image')->store('avatars', 'public');
        $user->avatar = url(Storage::url($path));
        $user->save();

        return response()->json([
            'message' => 'Avatar uploaded successfully',
            'avatar_url' => $user->avatar,
            'user' => $user
        ]);
    }

    /**
     * Delete profile avatar
     */
    public function deleteAvatar(Request $request)
    {
        $user = $request->user();

        if ($user->avatar) {
            $oldPath = str_replace(url('storage/'), '', $user->avatar);
            Storage::disk('public')->delete($oldPath);
            $user->avatar = null;
            $user->save();
        }

        return response()->json([
            'message' => 'Avatar deleted successfully',
            'user' => $user
        ]);
    }

    /**
     * POST /api/user/location
     */
    public function saveLocation(Request $request)
    {
        $data = $request->validate([
            'lat' => 'required|numeric|between:-90,90',
            'lng' => 'required|numeric|between:-180,180',
        ]);

        $user = $request->user();
        $user->location = [
            'lat' => (float) $data['lat'],
            'lng' => (float) $data['lng'],
        ];
        $user->save();

        return response()->json([
            'message' => 'Location saved',
            'location' => $user->location,
        ]);
    }
}
