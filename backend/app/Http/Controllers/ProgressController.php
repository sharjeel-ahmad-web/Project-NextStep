<?php

namespace App\Http\Controllers;

use App\Models\Progress;
use App\Models\Roadmap;
use App\Models\UserStats;
use App\Services\PracticeTaskService;
use Illuminate\Support\Carbon;
use Illuminate\Http\Request;

class ProgressController extends Controller
{
    public function __construct(protected PracticeTaskService $practiceTaskService)
    {
    }

    /**
     * POST /api/progress/start
     */
    public function start(Request $request)
    {
        try {
            $validated = $request->validate([
                'roadmap_id' => 'required|string',
            ]);

            $userId     = (string) $request->user()->_id;
            $roadmapId  = $validated['roadmap_id'];

            // Prevent duplicate
            $existing = Progress::where('user_id', $userId)
                ->where('roadmap_id', $roadmapId)
                ->first();

            if ($existing) {
                return response()->json(['success' => true, 'data' => $existing]);
            }

            $progress = Progress::create([
                'user_id'         => $userId,
                'roadmap_id'      => $roadmapId,
                'completed_nodes' => [],
                'videos_watched'  => [],
                'node_activity'   => [],
                'practice_tasks'  => $this->practiceTaskService->buildTasksFromRoadmap(Roadmap::find($roadmapId)),
                'status'          => 'in_progress',
                'started_at'      => now(),
            ]);

            return response()->json(['success' => true, 'data' => $progress], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to start progress', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/progress/{id}/complete  – mark a node complete
     */
    public function complete(Request $request, $id)
    {
        try {
            // Log for debugging
            \Illuminate\Support\Facades\Log::info('Progress complete request', [
                'id' => $id,
                'request' => $request->all()
            ]);

            $request->validate(['node_id' => 'required']);

            $progress = Progress::where('_id', $id)
                ->where('user_id', (string) $request->user()->_id)
                ->first();

            if (!$progress) {
                return response()->json(['message' => 'Progress record not found'], 404);
            }

            $nodeId          = (string) $request->input('node_id');
            $completedNodes  = $progress->completed_nodes ?? [];
            $nodeActivity    = $progress->node_activity ?? [];
            $roadmap         = Roadmap::find($progress->roadmap_id);
            $nodeMeta        = $this->findRoadmapNode($roadmap, $nodeId);

            if (!in_array($nodeId, $completedNodes)) {
                $completedNodes[] = $nodeId;
                $progress->completed_nodes = $completedNodes;
                $nodeActivity[] = [
                    'node_id'      => $nodeId,
                    'skill_name'   => $nodeMeta['skill_name'] ?? ($nodeMeta['title'] ?? 'Skill'),
                    'title'        => $nodeMeta['title'] ?? 'Completed skill',
                    'completed_at' => now()->toIso8601String(),
                ];
                $progress->node_activity = $nodeActivity;

                // Check if roadmap is fully complete
                if ($roadmap && count($completedNodes) >= count($roadmap->nodes ?? [])) {
                    $progress->status       = 'completed';
                    $progress->completed_at = now();

                    // Award XP for completing roadmap
                    $stats = UserStats::forUser((string) $request->user()->_id);
                    $stats->addXp(200);
                } else {
                    // Award XP per node
                    $stats = UserStats::forUser((string) $request->user()->_id);
                    $stats->addXp(10);
                }

                $progress->save();
            }

            return response()->json(['success' => true, 'data' => $progress]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Progress update error: ' . $e->getMessage(), [
                'exception' => $e,
                'id' => $id,
                'request' => $request->all()
            ]);
            return response()->json(['message' => 'Failed to update progress', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/progress/{id}/track-video
     */
    public function trackVideo(Request $request, $id)
    {
        try {
            $request->validate(['video_id' => 'required|string']);

            $progress = Progress::where('_id', $id)
                ->where('user_id', (string) $request->user()->_id)
                ->first();

            if (!$progress) {
                return response()->json(['message' => 'Progress record not found'], 404);
            }

            $videoId         = $request->input('video_id');
            $videosWatched   = $progress->videos_watched ?? [];

            if (!in_array($videoId, $videosWatched)) {
                $videosWatched[] = $videoId;
                $progress->videos_watched = $videosWatched;
                $progress->save();
            }

            return response()->json(['success' => true, 'data' => $progress]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to track video', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * GET /api/progress/roadmap/{roadmapId}
     */
    public function getRoadmapProgress(Request $request, $roadmapId)
    {
        $progress = Progress::where('user_id', (string) $request->user()->_id)
            ->where('roadmap_id', $roadmapId)
            ->first();

        if (!$progress) {
             return response()->json([]);
        }

        $roadmap = Roadmap::find($roadmapId);
        if (!$roadmap) {
             return response()->json([]);
        }

        $completedNodes = $progress->completed_nodes ?? [];
        $nodeProgress   = [];

        foreach ($roadmap->nodes ?? [] as $node) {
            $nodeId = (string) $node['id'];
            $isCompleted = in_array($nodeId, $completedNodes);
            
            $nodeProgress[] = [
                'id'          => $progress->_id,
                'node_id'     => $nodeId,
                'status'      => $isCompleted ? 'completed' : 'in_progress',
                'progress_id' => (string) $progress->_id,
            ];
        }

        return response()->json([
            'node_progress' => $nodeProgress,
            'passed_quizzes' => $progress->passed_quizzes ?? [],
            'practice_tasks' => $progress->practice_tasks ?: $this->practiceTaskService->syncTasksForRoadmap($progress, $roadmap),
        ]);
    }

    /**
     * POST /api/progress/{id}/practice-task
     */
    public function updatePracticeTask(Request $request, $id)
    {
        $validated = $request->validate([
            'task_id' => 'required|string',
            'completed' => 'nullable|boolean',
            'portfolio_url' => 'nullable|url|max:2048',
            'submission_notes' => 'nullable|string|max:3000',
        ]);

        $progress = Progress::where('_id', $id)
            ->where('user_id', (string) $request->user()->_id)
            ->first();

        if (!$progress) {
            return response()->json(['message' => 'Progress record not found'], 404);
        }

        $tasks = $this->practiceTaskService->updateTask($progress, $validated['task_id'], $validated);

        if (empty($tasks)) {
            return response()->json(['message' => 'Practice task not found'], 404);
        }

        return response()->json([
            'success' => true,
            'practice_tasks' => $tasks,
        ]);
    }

    /**
     * POST /api/progress/{id}/practice-submission
     */
    public function uploadPracticeSubmission(Request $request, $id)
    {
        $validated = $request->validate([
            'task_id' => 'required|string',
            'file' => 'required|file|max:10240',
        ]);

        $progress = Progress::where('_id', $id)
            ->where('user_id', (string) $request->user()->_id)
            ->first();

        if (!$progress) {
            return response()->json(['message' => 'Progress record not found'], 404);
        }

        \Illuminate\Support\Facades\Log::info('Practice submission attempt', [
            'progress_id' => $id,
            'requested_task_id' => $validated['task_id'],
            'available_task_ids' => collect($progress->practice_tasks ?? [])->pluck('task_id')->toArray()
        ]);

        $tasks = $this->practiceTaskService->attachSubmissionFile($progress, $validated['task_id'], $request->file('file'));

        if (empty($tasks)) {
            return response()->json(['message' => 'Practice task not found'], 404);
        }

        return response()->json([
            'success' => true,
            'practice_tasks' => $tasks,
        ]);
    }

    /**
     * GET /api/progress/weekly-insights
     */
    public function getWeeklyInsights(Request $request)
    {
        $userId = (string) $request->user()->_id;
        $weekStart = now()->startOfWeek();
        $weekEnd = now()->endOfWeek();

        $progressRecords = Progress::where('user_id', $userId)->get();
        $roadmaps = Roadmap::where('user_id', $userId)->get()->keyBy('_id');

        $completedThisWeek = 0;
        $videosWatchedThisWeek = 0;
        $activeRoadmaps = 0;
        $weakPoints = [];
        $weeklyAssignments = [];

        foreach ($progressRecords as $progress) {
            $roadmap = $roadmaps->get($progress->roadmap_id);
            if (!$roadmap) {
                continue;
            }

            if (($progress->status ?? null) !== 'completed') {
                $activeRoadmaps++;
            }

            foreach (($progress->node_activity ?? []) as $activity) {
                $completedAt = data_get($activity, 'completed_at');

                if ($completedAt && Carbon::parse($completedAt)->between($weekStart, $weekEnd)) {
                    $completedThisWeek++;
                }
            }

            foreach (($roadmap->nodes ?? []) as $node) {
                $nodeId = (string) ($node['id'] ?? '');
                $isCompleted = in_array($nodeId, $progress->completed_nodes ?? []);

                if ($isCompleted) {
                    continue;
                }

                $weakPoints[] = [
                    'roadmap_id' => (string) $roadmap->_id,
                    'target_role' => $roadmap->target_role,
                    'skill_name' => $node['skill_name'] ?? ($node['title'] ?? 'Skill'),
                    'title' => $node['title'] ?? 'Learning milestone',
                    'level' => $node['level'] ?? 'Beginner',
                    'estimated_time' => $node['estimated_time'] ?? '1 week',
                    'reason' => 'This skill is still incomplete and is slowing overall roadmap progress.',
                    'recommendation' => 'Repeat this topic, rewatch one focused lesson, and complete a short revision session before moving ahead.',
                ];
            }

            $videosWatchedThisWeek += count($progress->videos_watched ?? []);

        }

        $weeklyAssignments = $this->practiceTaskService->buildWeeklyAssignments($progressRecords, $roadmaps);

        $topWeakPoints = collect($weakPoints)->take(4)->values();
        $topAssignments = collect($weeklyAssignments)->take(4)->values();
        $summary = $this->buildWeeklySummary($completedThisWeek, $activeRoadmaps, $topWeakPoints->count());

        return response()->json([
            'week_range' => [
                'start' => $weekStart->toDateString(),
                'end' => $weekEnd->toDateString(),
            ],
            'summary' => $summary,
            'stats' => [
                'completed_this_week' => $completedThisWeek,
                'active_roadmaps' => $activeRoadmaps,
                'videos_watched_total' => $videosWatchedThisWeek,
                'weak_points_count' => $topWeakPoints->count(),
                'assignments_count' => $topAssignments->count(),
            ],
            'weak_points' => $topWeakPoints,
            'weekly_assignments' => $topAssignments,
        ]);
    }

    protected function findRoadmapNode(?Roadmap $roadmap, string $nodeId): array
    {
        if (!$roadmap) {
            return [];
        }

        foreach (($roadmap->nodes ?? []) as $node) {
            if ((string) ($node['id'] ?? '') === $nodeId) {
                return $node;
            }
        }

        return [];
    }

    protected function buildWeeklySummary(int $completedThisWeek, int $activeRoadmaps, int $weakPointsCount): array
    {
        if ($completedThisWeek === 0) {
            return [
                'headline' => 'Your weekly progress is low.',
                'message' => 'Repeat one weak topic this week and finish at least one blocked skill to rebuild momentum.',
            ];
        }

        if ($completedThisWeek < 3) {
            return [
                'headline' => 'Momentum is building, but some weak points need revision.',
                'message' => 'Repeat the highlighted skills before they turn into bigger gaps across your roadmap.',
            ];
        }

        return [
            'headline' => 'Good weekly momentum.',
            'message' => $weakPointsCount > 0
                ? 'You are progressing well. Repeat the highlighted weak points once so they do not slow next week.'
                : 'You are progressing well and have no urgent weak points highlighted right now.',
        ];
    }

}
