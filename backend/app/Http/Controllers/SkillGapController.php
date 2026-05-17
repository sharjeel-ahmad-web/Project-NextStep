<?php

namespace App\Http\Controllers;

use App\Services\GeminiService;
use Illuminate\Http\Request;
use Smalot\PdfParser\Parser;

class SkillGapController extends Controller
{
    protected GeminiService $geminiService;

    public function __construct(GeminiService $geminiService)
    {
        $this->geminiService = $geminiService;
    }

    /**
     * POST /api/skill-gap/analyze
     */
    public function analyze(Request $request)
    {
        try {
            $request->validate([
                'target_role'     => 'required|string|max:255',
                'description'     => 'nullable|string',
                'job_description' => 'nullable|string',
                'resume'          => 'nullable|file|mimes:pdf|max:10240',
            ]);

            $targetRole  = $request->input('target_role');
            $description = $request->input('job_description') ?: $request->input('description');
            $language    = $request->input('language', 'English');
            $resumeText  = "";

            if (empty($description)) {
                return response()->json(['message' => 'Job description or goal is required'], 400);
            }

            // Parse PDF if provided
            if ($request->hasFile('resume')) {
                $parser = new Parser();
                $pdf = $parser->parseFile($request->file('resume')->getPathname());
                $resumeText = $pdf->getText();
            }

            // Perform AI Analysis via Gemini
            $analysis = $this->geminiService->analyzeSkillGap(
                $resumeText ?: "No resume provided. Analyze based on goal: $description",
                $targetRole,
                $description,
                $language
            );

            if (empty($analysis)) {
                throw new \Exception("AI analysis failed to provide a valid response.");
            }

            return response()->json([
                'success'        => true,
                'target_role'    => $targetRole,
                'language'       => $language,
                'current_skills' => $analysis['current_skills']  ?? [],
                'required_skills'=> $analysis['required_skills'] ?? [],
                'skill_gaps'     => $analysis['skill_gaps']     ?? [],
                'gap_count'      => count($analysis['skill_gaps'] ?? []),
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Analysis failed',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
}
