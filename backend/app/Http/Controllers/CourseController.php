<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    // Get all courses from MongoDB
    public function index()
    {
        $courses = Course::where('is_published', true)->get();
        return response()->json([
            'success' => true,
            'data' => $courses,
            'count' => $courses->count()
        ]);
    }

    // Get single course by ID
    public function show($id)
    {
        $course = Course::with('lessons')->find($id);
        
        if (!$course) {
            return response()->json([
                'success' => false,
                'message' => 'Course not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $course
        ]);
    }

    // Create new course in MongoDB
    public function store(Request $request)
    {
        if (!$request->user()?->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'instructor_id' => 'required|string',
            'category' => 'required|string',
            'level' => 'required|in:beginner,intermediate,advanced',
            'duration_hours' => 'required|integer',
            'price' => 'required|numeric',
        ]);

        $course = Course::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Course created successfully',
            'data' => $course
        ], 201);
    }

    // Update course in MongoDB
    public function update(Request $request, $id)
    {
        if (!$request->user()?->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $course = Course::find($id);

        if (!$course) {
            return response()->json([
                'success' => false,
                'message' => 'Course not found'
            ], 404);
        }

        $course->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Course updated successfully',
            'data' => $course
        ]);
    }

    // Delete course from MongoDB
    public function destroy(Request $request, $id)
    {
        if (!$request->user()?->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $course = Course::find($id);

        if (!$course) {
            return response()->json([
                'success' => false,
                'message' => 'Course not found'
            ], 404);
        }

        $course->delete();

        return response()->json([
            'success' => true,
            'message' => 'Course deleted successfully'
        ]);
    }
}
