<?php

namespace App\Services;

use App\Models\Progress;
use App\Models\Roadmap;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;

class PracticeTaskService
{
    public function buildTasksFromRoadmap(?Roadmap $roadmap): array
    {
        if (!$roadmap) {
            return [];
        }

        $tasks = [];

        foreach (($roadmap->nodes ?? []) as $node) {
            $nodeId = (string) ($node['id'] ?? '');
            $skillName = $node['skill_name'] ?? ($node['title'] ?? 'Skill');
            $tasks[] = [
                'task_id' => "task-{$nodeId}",
                'node_id' => $nodeId,
                'skill_name' => $skillName,
                'title' => "Build one mini project for {$skillName}",
                'deliverable' => "Create one small practical task or portfolio-ready example using {$skillName}.",
                'revision_step' => "Revise the concept once and explain the solution in your own words.",
                'completed' => false,
                'completed_at' => null,
                'portfolio_url' => null,
                'submission_notes' => null,
                'submission_file_url' => null,
                'mentor_review_status' => 'not_submitted',
                'mentor_feedback' => null,
            ];
        }

        return $tasks;
    }

    public function syncTasksForRoadmap(Progress $progress, ?Roadmap $roadmap): array
    {
        $existing = collect($progress->practice_tasks ?? [])->keyBy('task_id');
        $generated = collect($this->buildTasksFromRoadmap($roadmap))->map(function ($task) use ($existing) {
            $saved = $existing->get($task['task_id'], []);
            return array_merge($task, is_array($saved) ? $saved : []);
        })->values()->all();

        return $generated;
    }

    public function updateTask(Progress $progress, string $taskId, array $payload): array
    {
        $tasks = $progress->practice_tasks ?? [];

        foreach ($tasks as &$task) {
            if ((string) ($task['task_id'] ?? '') !== $taskId) {
                continue;
            }

            if (array_key_exists('completed', $payload)) {
                $task['completed'] = (bool) $payload['completed'];
                $task['completed_at'] = $payload['completed'] ? now()->toIso8601String() : null;
            }

            if (array_key_exists('portfolio_url', $payload)) {
                $task['portfolio_url'] = $payload['portfolio_url'] ?: null;
            }

            if (array_key_exists('submission_notes', $payload)) {
                $task['submission_notes'] = $payload['submission_notes'] ?: null;
            }

            if (($task['portfolio_url'] ?? null) || ($task['submission_file_url'] ?? null) || ($task['submission_notes'] ?? null)) {
                $task['mentor_review_status'] = 'submitted';
            } elseif (($task['mentor_review_status'] ?? '') === 'submitted' && empty($task['submission_file_url']) && empty($task['portfolio_url']) && empty($task['submission_notes'])) {
                $task['mentor_review_status'] = 'not_submitted';
            }

            $progress->practice_tasks = $tasks;
            $progress->save();

            return $tasks;
        }

        return [];
    }

    public function attachSubmissionFile(Progress $progress, string $taskId, $file): array
    {
        $tasks = $progress->practice_tasks ?? [];
        $found = false;

        foreach ($tasks as &$task) {
            if ((string) ($task['task_id'] ?? '') === $taskId) {
                $found = true;
                if (!empty($task['submission_file_url'])) {
                    $oldPath = str_replace(url('storage/'), '', $task['submission_file_url']);
                    Storage::disk('public')->delete($oldPath);
                }

                $path = $file->store('practice-submissions', 'public');
                $task['submission_file_url'] = url(Storage::url($path));
                $task['mentor_review_status'] = 'submitted';
                break;
            }
        }

        if (!$found) {
            // Try to sync tasks if roadmap is available
            $roadmap = Roadmap::find($progress->roadmap_id);
            if ($roadmap) {
                $tasks = $this->syncTasksForRoadmap($progress, $roadmap);
                // Try one more time with synced tasks
                foreach ($tasks as &$task) {
                    if ((string) ($task['task_id'] ?? '') === $taskId) {
                        $path = $file->store('practice-submissions', 'public');
                        $task['submission_file_url'] = url(Storage::url($path));
                        $task['mentor_review_status'] = 'submitted';
                        $found = true;
                        break;
                    }
                }
            }
        }

        if ($found) {
            $progress->practice_tasks = $tasks;
            $progress->save();
            return $tasks;
        }

        return [];
    }


    public function buildWeeklyAssignments(iterable $progressRecords, iterable $roadmaps): array
    {
        $roadmapMap = collect($roadmaps)->keyBy('_id');
        $weeklyAssignments = [];

        foreach ($progressRecords as $progress) {
            $roadmap = $roadmapMap->get($progress->roadmap_id);
            if (!$roadmap) {
                continue;
            }

            foreach (($progress->practice_tasks ?? []) as $task) {
                if (!($task['completed'] ?? false)) {
                    $weeklyAssignments[] = [
                        'task_id' => $task['task_id'] ?? '',
                        'roadmap_id' => (string) $roadmap->_id,
                        'target_role' => $roadmap->target_role,
                        'skill_name' => $task['skill_name'] ?? 'Practice task',
                        'title' => $task['title'] ?? 'Practice assignment',
                        'deliverable' => $task['deliverable'] ?? '',
                        'revision_step' => $task['revision_step'] ?? '',
                        'mentor_review_status' => $task['mentor_review_status'] ?? 'not_submitted',
                    ];
                }
            }
        }

        return $weeklyAssignments;
    }
}
