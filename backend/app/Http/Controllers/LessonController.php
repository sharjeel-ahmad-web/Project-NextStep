<?php

namespace App\Http\Controllers;

use App\Models\Lesson;
use App\Models\Course;
use Illuminate\Http\Request;

class LessonController extends Controller
{
    // Admin: Create new lesson for a course
    public function store(Request $request, $courseId)
    {
        if (!$request->user()?->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $course = Course::find($courseId);
        if (!$course) {
            return response()->json(['message' => 'Course not found'], 404);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'video_url' => 'required|url',
            'duration_minutes' => 'required|integer',
            'order' => 'required|integer',
        ]);

        $validated['course_id'] = $courseId;
        $validated['is_published'] = true;

        $lesson = Lesson::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Lesson created successfully',
            'data' => $lesson
        ], 201);
    }

    // Admin: Update existing lesson
    public function update(Request $request, $id)
    {
        if (!$request->user()?->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $lesson = Lesson::find($id);
        if (!$lesson) {
            return response()->json(['message' => 'Lesson not found'], 404);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'video_url' => 'sometimes|url',
            'duration_minutes' => 'sometimes|integer',
            'order' => 'sometimes|integer',
        ]);

        $lesson->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Lesson updated successfully',
            'data' => $lesson
        ]);
    }

    // Admin: Delete lesson
    public function destroy(Request $request, $id)
    {
        if (!$request->user()?->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $lesson = Lesson::find($id);
        if (!$lesson) {
            return response()->json(['message' => 'Lesson not found'], 404);
        }

        $lesson->delete();

        return response()->json([
            'success' => true,
            'message' => 'Lesson deleted successfully'
        ]);
    }
}
