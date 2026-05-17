<?php

namespace App\Http\Controllers;

use App\Models\Roadmap;
use App\Models\UserStats;
use App\Services\GeminiService;
use Illuminate\Http\Request;

class RoadmapController extends Controller
{
    protected GeminiService $geminiService;

    public function __construct(GeminiService $geminiService)
    {
        $this->geminiService = $geminiService;
    }

    /**
     * GET /api/roadmaps  – list user's roadmaps
     */
    public function index(Request $request)
    {
        $roadmaps = Roadmap::where('user_id', (string) $request->user()->_id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($roadmaps);
    }

    /**
     * POST /api/roadmaps/generate  – create a new roadmap
     */
    public function generate(Request $request)
    {
        try {
            $validated = $request->validate([
                'target_role'    => 'required|string|max:255',
                'description'    => 'nullable|string',
                'job_description'=> 'nullable|string',
                'current_skills' => 'nullable|array',
                'skill_gaps'     => 'nullable|array',
                'language'       => 'nullable|string|max:80',
            ]);

            $targetRole   = $validated['target_role'];
            $skillGaps    = $validated['skill_gaps']    ?? [];
            $currentSkills= $validated['current_skills']?? [];
            $description  = $validated['job_description'] ?? ($validated['description'] ?? "I want to become a $targetRole");
            $language     = $validated['language'] ?? 'English';

            // Use Gemini to generate professional, job-ready roadmap nodes
            $nodes = $this->geminiService->generateRoadmap($targetRole, $skillGaps, $description, $language);

            if (empty($nodes)) {
                throw new \Exception("AI failed to generate professional roadmap nodes.");
            }

            // Ensure nodes have all required fields for the UI
            $formattedNodes = array_map(function ($node, $index) {
                return [
                    'id'             => $index + 1,
                    'skill_name'     => $node['skill_name']  ?? 'General',
                    'title'          => $node['title']       ?? 'New Lesson',
                    'description'    => $node['description'] ?? 'No description available.',
                    'estimated_time' => $node['estimated_time'] ?? '1 week',
                    'level'          => $node['level']       ?? 'Beginner',
                    'resources'      => [], // To be fetched dynamically via getVideos
                    'completed'      => false,
                    'order'          => $index + 1,
                ];
            }, $nodes, array_keys($nodes));

            $roadmap = Roadmap::create([
                'user_id'        => (string) $request->user()->_id,
                'target_role'    => $targetRole,
                'description'    => $description,
                'current_skills' => $currentSkills,
                'skill_gaps'     => $skillGaps,
                'language'       => $language,
                'nodes'          => array_values($formattedNodes),
                'status'         => 'active',
            ]);

            // Award XP for creating a roadmap
            $stats = UserStats::forUser((string) $request->user()->_id);
            $stats->addXp(50);

            return response()->json($roadmap, 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Roadmap generation failed',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * GET /api/roadmaps/{id}  – get a single roadmap
     */
    public function show(Request $request, $id)
    {
        $roadmap = Roadmap::where('_id', $id)
            ->where('user_id', (string) $request->user()->_id)
            ->first();

        if (!$roadmap) {
            return response()->json(['message' => 'Roadmap not found'], 404);
        }

        return response()->json($roadmap);
    }

    /**
     * DELETE /api/roadmaps/{id}
     */
    public function destroy(Request $request, $id)
    {
        $roadmap = Roadmap::where('_id', $id)
            ->where('user_id', (string) $request->user()->_id)
            ->first();

        if (!$roadmap) {
            return response()->json(['message' => 'Roadmap not found'], 404);
        }

        $roadmap->delete();

        return response()->json(['message' => 'Roadmap deleted successfully']);
    }

    /**
     * GET /api/roadmaps/{id}/videos  – get video resources for a skill
     */
    public function getVideos(Request $request, $id)
    {
        $roadmap = Roadmap::where('_id', $id)
            ->where('user_id', (string) $request->user()->_id)
            ->first();

        if (!$roadmap) {
            return response()->json(['message' => 'Roadmap not found'], 404);
        }

        $skill    = $request->query('skill', $roadmap->target_role);
        $language = $request->query('language', $roadmap->language ?? 'English');
        
        // Fetch dynamic videos via Gemini in the user's preferred preparation language.
        $videos = $this->geminiService->getYouTubeResources($skill, $language);

        return response()->json(['videos' => $videos, 'language' => $language]);
    }
}
