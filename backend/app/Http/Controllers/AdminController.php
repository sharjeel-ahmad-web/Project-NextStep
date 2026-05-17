<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Roadmap;
use App\Models\Certificate;
use App\Models\Progress;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    /**
     * GET /api/admin/users
     */
    public function getUsers(Request $request)
    {
        if (!$request->user()?->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $perPage = (int) $request->query('per_page', 20);
        $search  = $request->query('search', '');

        $query = User::query();
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'data'  => $users->items(),
            'total' => $users->total(),
            'page'  => $users->currentPage(),
            'pages' => $users->lastPage(),
        ]);
    }

    /**
     * DELETE /api/admin/users/{id}
     */
    public function deleteUser(Request $request, $id)
    {
        if (!$request->user()?->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        if ($user->role === 'admin') {
            return response()->json(['message' => 'Cannot delete admin user'], 403);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }

    /**
     * PATCH /api/admin/users/{id}/role
     */
    public function updateRole(Request $request, $id)
    {
        if (!$request->user()?->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $request->validate([
            'role' => 'required|string|in:user,admin'
        ]);

        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $user->role = $request->role;
        $user->save();

        return response()->json(['message' => 'User role updated', 'user' => $user]);
    }

    /**
     * GET /api/admin/stats
     */
    public function getStats(Request $request)
    {
        if (!$request->user()?->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json([
            'total_users'        => User::count(),
            'total_roadmaps'     => Roadmap::count(),
            'total_certificates' => Certificate::count(),
            'active_today'       => User::where('updated_at', '>=', now()->startOfDay())->count(),
            'submitted_assignments' => Progress::raw(function ($collection) {
                return $collection->countDocuments([
                    'practice_tasks.mentor_review_status' => 'submitted',
                ]);
            }),
        ]);
    }

    /**
     * DELETE /api/admin/certificates/{id}
     */
    public function deleteCertificate(Request $request, $id)
    {
        if (!$request->user()?->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $cert = Certificate::find($id);
        if (!$cert) {
            return response()->json(['message' => 'Certificate not found'], 404);
        }

        $cert->delete();
        return response()->json(['message' => 'Certificate deleted']);
    }

    public function getPracticeReviews(Request $request)
    {
        if (!$request->user()?->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $progressRecords = Progress::all();
        $users = User::all()->keyBy('_id');
        $roadmaps = Roadmap::all()->keyBy('_id');
        $reviews = [];

        foreach ($progressRecords as $progress) {
            foreach (($progress->practice_tasks ?? []) as $task) {
                if (!in_array($task['mentor_review_status'] ?? 'not_submitted', ['submitted', 'approved', 'needs_revision'], true)) {
                    continue;
                }

                $user = $users->get($progress->user_id);
                $roadmap = $roadmaps->get($progress->roadmap_id);

                $reviews[] = [
                    'progress_id' => (string) $progress->_id,
                    'task_id' => $task['task_id'] ?? '',
                    'user_name' => $user?->name ?? 'Unknown',
                    'user_email' => $user?->email ?? '',
                    'target_role' => $roadmap?->target_role ?? 'Unknown',
                    'title' => $task['title'] ?? 'Practice assignment',
                    'portfolio_url' => $task['portfolio_url'] ?? null,
                    'submission_notes' => $task['submission_notes'] ?? null,
                    'submission_file_url' => $task['submission_file_url'] ?? null,
                    'mentor_review_status' => $task['mentor_review_status'] ?? 'submitted',
                    'mentor_feedback' => $task['mentor_feedback'] ?? null,
                ];
            }
        }

        return response()->json(['reviews' => $reviews]);
    }

    public function reviewPracticeTask(Request $request, $progressId)
    {
        if (!$request->user()?->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'task_id' => 'required|string',
            'status' => 'required|string|in:approved,needs_revision',
            'mentor_feedback' => 'nullable|string|max:3000',
        ]);

        $progress = Progress::find($progressId);
        if (!$progress) {
            return response()->json(['message' => 'Progress not found'], 404);
        }

        $tasks = $progress->practice_tasks ?? [];
        $found = false;

        foreach ($tasks as &$task) {
            if (($task['task_id'] ?? '') !== $validated['task_id']) {
                continue;
            }

            $task['mentor_review_status'] = $validated['status'];
            $task['mentor_feedback'] = $validated['mentor_feedback'] ?? null;
            $found = true;
            break;
        }

        if (!$found) {
            return response()->json(['message' => 'Task not found'], 404);
        }

        $progress->practice_tasks = $tasks;
        $progress->save();

        return response()->json(['message' => 'Practice task reviewed successfully']);
    }
}
