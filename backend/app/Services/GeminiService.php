<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use DateInterval;

class GeminiService
{
    protected string $apiKey;
    protected string $endpoint;
    protected ?string $youtubeApiKey;

    public function __construct()
    {
        $this->apiKey = config('services.gemini.key', env('GEMINI_API_KEY'));
        $this->youtubeApiKey = config('services.youtube.key', env('YOUTUBE_API_KEY'));
        // Using v1beta and flash-latest as found in model list
        $this->endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';
    }

    /**
     * Analyze resume text against target role and description to find skill gaps
     */
    public function analyzeSkillGap(string $resumeText, string $targetRole, string $description, string $language = 'English'): array
    {
        try {
            $prompt = "You are an expert career advisor and technical recruiter. 
            Analyze the following resume text against the target role and the user's personal goal.
            
            Target Role: {$targetRole}
            User's Goal/Description: {$description}
            Preferred Learning Language: {$language}
            
            Resume Text:
            {$resumeText}
            
            Identify:
            1. Current Skills (found in resume that are relevant to the role)
            2. Required Skills (standard industry requirements for this role)
            3. Skill Gaps (required skills missing or weak in the resume)
            
            Return ONLY a valid JSON object with these keys: 'current_skills' (array), 'required_skills' (array), 'skill_gaps' (array).";

            $response = $this->callGemini($prompt);
            return json_decode($response, true) ?? [];

        } catch (\Exception $e) {
            Log::error('Gemini Skill Gap Analysis error: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Generate a professional, job-ready roadmap based on gaps
     */
    public function generateRoadmap(string $targetRole, array $skillGaps, string $description, string $language = 'English'): array
    {
        try {
            $prompt = "Create a professional, job-ready learning roadmap for the role of '{$targetRole}'.
            User Goal: {$description}
            Preferred Learning Language: {$language}
            The user needs to focus on these specific gaps: " . implode(', ', $skillGaps) . "
            
            The roadmap should be highly structured and cover everything needed to be JOB-READY.
            Write node titles and descriptions in {$language} when possible, while keeping skill_name in widely searchable technical terms.
            
            Return a JSON array of 'nodes'. Each node must have:
            - title: Clear learning objective
            - description: Detailed what to learn
            - skill_name: The core technology/skill (used for video fetching)
            - estimated_time: (e.g., '1 week')
            - level: (Beginner, Intermediate, or Advanced)
            - order: (Integer)
            
            Return ONLY the valid JSON array of nodes.";

            $response = $this->callGemini($prompt);
            return json_decode($response, true) ?? [];

        } catch (\Exception $e) {
            Log::error('Gemini Roadmap Generation error: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Internal helper to call Gemini API
     */
    protected function callGemini(string $prompt): string
    {
        Log::info('Gemini API Request', ['prompt_snippet' => substr($prompt, 0, 100) . '...']);

        $response = Http::post("{$this->endpoint}?key={$this->apiKey}", [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt]
                    ]
                ]
            ]
        ]);

        if ($response->failed()) {
            Log::error('Gemini API request failed', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            throw new \Exception('Gemini API call failed: ' . $response->body());
        }

        $content = $response->json();
        $text = $content['candidates'][0]['content']['parts'][0]['text'] ?? '';
        
        Log::info('Gemini API Raw Response Text', ['text_snippet' => substr($text, 0, 200) . '...']);

        // Robust JSON extraction
        $cleanText = trim($text);
        
        $startObj = strpos($cleanText, '{');
        $startArr = strpos($cleanText, '[');
        
        if ($startObj === false && $startArr === false) {
            Log::error('Gemini API returned no JSON format', ['text' => $text]);
            return $cleanText;
        }
        
        $start = ($startObj !== false && $startArr !== false) ? min($startObj, $startArr) : ($startObj !== false ? $startObj : $startArr);
        
        $endObj = strrpos($cleanText, '}');
        $endArr = strrpos($cleanText, ']');
        $end = ($endObj !== false && $endArr !== false) ? max($endObj, $endArr) : ($endObj !== false ? $endObj : $endArr);
        
        if ($end !== false && $end > $start) {
            $cleanText = substr($cleanText, $start, $end - $start + 1);
        }
        
        return $cleanText;
    }

    /**
     * Get YouTube resources for a specific skill via Gemini
     */
    public function getYouTubeResources(string $skill, string $language = 'English'): array
    {
        try {
            $youtubeResults = $this->getYoutubeApiResources($skill, $language);

            if (!empty($youtubeResults)) {
                return $youtubeResults;
            }

            $prompt = "Provide a JSON array of 5 popular and high-quality YouTube video tutorials for learning '{$skill}' in {$language}. 
            Prioritize videos that teach in {$language} or clearly support {$language}-speaking learners.
            Each object should have:
            - title: The video title
            - video_id: The YouTube 11-character video ID
            - duration: Approximate duration (e.g., '15 min')
            - thumbnail: The standard YouTube thumbnail URL (https://img.youtube.com/vi/VIDEO_ID/hqdefault.jpg)
            
            Return ONLY the valid JSON array.";

            $text = $this->callGemini($prompt);
            $videos = json_decode($text, true);

            if (!is_array($videos)) {
                return $this->getFallbackVideos($skill, $language);
            }

            return array_map(function ($video, $index) {
                return [
                    'id'        => (string) ($index + 1),
                    'video_id'  => $video['video_id'] ?? '',
                    'title'     => $video['title'] ?? 'Tutorial',
                    'url'       => 'https://www.youtube.com/watch?v=' . ($video['video_id'] ?? ''),
                    'thumbnail' => $video['thumbnail'] ?? "https://img.youtube.com/vi/" . ($video['video_id'] ?? '') . "/hqdefault.jpg",
                    'duration'  => $video['duration'] ?? 'varies',
                ];
            }, $videos, array_keys($videos));

        } catch (\Exception $e) {
            Log::error('Gemini Video Service error: ' . $e->getMessage());
            return $this->getFallbackVideos($skill, $language);
        }
    }

    protected function getYoutubeApiResources(string $skill, string $language = 'English'): array
    {
        if (empty($this->youtubeApiKey)) {
            return [];
        }

        $query = trim($skill . ' tutorial ' . $language);

        $searchResponse = Http::get('https://www.googleapis.com/youtube/v3/search', [
            'key' => $this->youtubeApiKey,
            'part' => 'snippet',
            'q' => $query,
            'type' => 'video',
            'videoEmbeddable' => 'true',
            'maxResults' => 5,
            'safeSearch' => 'strict',
            'relevanceLanguage' => $this->mapLanguageToYoutubeCode($language),
            'order' => 'relevance',
        ]);

        if ($searchResponse->failed()) {
            Log::warning('YouTube API search failed', ['body' => $searchResponse->body()]);
            return [];
        }

        $searchItems = $searchResponse->json('items', []);
        $videoIds = collect($searchItems)
            ->map(fn ($item) => data_get($item, 'id.videoId'))
            ->filter()
            ->values()
            ->all();

        if (empty($videoIds)) {
            return [];
        }

        $detailsResponse = Http::get('https://www.googleapis.com/youtube/v3/videos', [
            'key' => $this->youtubeApiKey,
            'part' => 'contentDetails,snippet',
            'id' => implode(',', $videoIds),
        ]);

        if ($detailsResponse->failed()) {
            Log::warning('YouTube API details failed', ['body' => $detailsResponse->body()]);
            return [];
        }

        $detailsMap = collect($detailsResponse->json('items', []))->keyBy('id');

        return collect($videoIds)->map(function ($videoId, $index) use ($detailsMap) {
            $video = $detailsMap->get($videoId);

            if (!$video) {
                return null;
            }

            return [
                'id' => (string) ($index + 1),
                'video_id' => $videoId,
                'title' => data_get($video, 'snippet.title', 'Tutorial'),
                'url' => 'https://www.youtube.com/watch?v=' . $videoId,
                'thumbnail' => data_get($video, 'snippet.thumbnails.high.url')
                    ?: data_get($video, 'snippet.thumbnails.medium.url')
                    ?: "https://img.youtube.com/vi/{$videoId}/hqdefault.jpg",
                'duration' => $this->formatYoutubeDuration(data_get($video, 'contentDetails.duration', 'PT0M')),
            ];
        })->filter()->values()->all();
    }

    /**
     * Generate 10 MCQs for a given video title and skill
     */
    public function generateQuiz(string $videoTitle, string $skillName): array
    {
        try {
            $prompt = "Generate a professional technical quiz for the video tutorial: '{$videoTitle}'.
            The skill focus is: '{$skillName}'.
            
            Return exactly 10 multiple-choice questions (MCQs) in a valid JSON array.
            Each question object must have:
            1. 'question': The question text.
            2. 'options': An array of 4 possible answers.
            3. 'correct_answer': The exact string from the options that is correct.
            4. 'explanation': A short explanation of why this answer is correct.

            Make sure the questions range from beginner to intermediate.
            Return ONLY the valid JSON array of 10 questions.";

            $response = $this->callGemini($prompt);
            $questions = json_decode($response, true);

            if (!is_array($questions) || count($questions) < 5) {
                throw new \Exception("AI failed to generate a valid quiz structure.");
            }

            return $questions;

        } catch (\Exception $e) {
            Log::error('Gemini Quiz Generation error: ' . $e->getMessage());
            return [];
        }
    }

    public function generateResumeBlueprint(array $payload): array
    {
        $prompt = $this->buildResumePrompt($payload);

        try {
            $response = $this->callGemini($prompt);
            $decoded = json_decode($response, true);

            if (is_array($decoded) && isset($decoded['resume_data'])) {
                return $this->withAtsBreakdown($decoded);
            }
        } catch (\Exception $e) {
            Log::error('Gemini Resume Generation error: ' . $e->getMessage());
        }

        return $this->withAtsBreakdown($this->getFallbackResumeBlueprint($payload));
    }

    public function generateImprovedResumeFromExisting(array $payload): array
    {
        $prompt = $this->buildExistingResumeImprovementPrompt($payload);

        try {
            $response = $this->callGemini($prompt);
            $decoded = json_decode($response, true);

            if (is_array($decoded) && isset($decoded['resume_data'])) {
                return $this->withAtsBreakdown($decoded);
            }
        } catch (\Exception $e) {
            Log::error('Gemini Existing Resume Improvement error: ' . $e->getMessage());
        }

        return $this->withAtsBreakdown($this->getFallbackResumeBlueprint([
            'target_role' => $payload['target_role'] ?? '',
            'industry' => $payload['industry'] ?? '',
            'experience_level' => $payload['experience_level'] ?? '',
            'has_photo' => $payload['has_photo'] ?? false,
        ]));
    }

    protected function getFallbackVideos(string $skill, string $language = 'English'): array
    {
        return [
            [
                'id'        => '1',
                'video_id'  => 'Y6shV7S6WpU',
                'title'     => "$skill Full Course for Beginners ($language)",
                'url'       => "https://www.youtube.com/watch?v=Y6shV7S6WpU",
                'thumbnail' => "https://img.youtube.com/vi/Y6shV7S6WpU/hqdefault.jpg",
                'duration'  => 'varies',
            ],
            [
                'id'        => '2',
                'video_id'  => 'fBNz5xF-Kx4',
                'title'     => "$skill Advanced Tutorial ($language)",
                'url'       => "https://www.youtube.com/watch?v=fBNz5xF-Kx4",
                'thumbnail' => "https://img.youtube.com/vi/fBNz5xF-Kx4/hqdefault.jpg",
                'duration'  => 'varies',
            ],
        ];
    }

    protected function buildResumePrompt(array $payload): string
    {
        $rawInput = $payload['raw_input'] ?? '';
        $targetRole = $payload['target_role'] ?? '';
        $industry = $payload['industry'] ?? '';
        $experienceLevel = $payload['experience_level'] ?? '';
        $hasPhoto = !empty($payload['has_photo']) ? 'yes' : 'no';

        return <<<PROMPT
You are the "International Resume Architect," an elite AI career consultant and ATS optimization expert.

Core responsibilities:
1. Rewrite work experience bullets in STAR format.
2. Start every bullet with strong action verbs.
3. Quantify results. If metrics are missing, add realistic placeholders and clearly mark them like [ADD METRIC].
4. Optimize for keywords relevant to the candidate's target role.
5. If photo is present, generate image-processing instructions to remove background, replace with solid #FFFFFF or #F0F8FF, center the face, and adjust contrast.
6. Select the best template ID from:
- TEMPL_CLASSIC_SERIF
- TEMPL_TECH_MINIMAL
- TEMPL_CREATIVE_MODERN
- TEMPL_EXECUTIVE_BOLD
- TEMPL_GLOBAL_PRO

Return ONLY a valid JSON object with this shape:
{
  "meta_data": {
    "recommended_template_id": "",
    "ats_score_forecast": "1-100",
    "image_processing_directive": null
  },
  "resume_data": {
    "personal_info": {
      "full_name": "",
      "professional_title": "",
      "email": "",
      "phone": "",
      "linkedin_url": "",
      "location": "City, Country",
      "photo_url_placeholder": "processed_photo.jpg"
    },
    "summary": "",
    "skills": {
      "hard_skills": [],
      "soft_skills": [],
      "tools_technologies": []
    },
    "work_experience": [
      {
        "company": "",
        "role": "",
        "location": "",
        "duration": "",
        "achievements": []
      }
    ],
    "education": [
      {
        "degree": "",
        "institution": "",
        "year": "",
        "gpa_or_honors": ""
      }
    ],
    "languages": [],
    "certifications": []
  }
}

Candidate target role: {$targetRole}
Candidate industry: {$industry}
Experience level: {$experienceLevel}
Photo provided: {$hasPhoto}

Input Data to Process:
{$rawInput}
PROMPT;
    }

    protected function buildExistingResumeImprovementPrompt(array $payload): string
    {
        $rawResumeText = $payload['raw_resume_text'] ?? '';
        $targetRole = $payload['target_role'] ?? '';
        $industry = $payload['industry'] ?? '';
        $experienceLevel = $payload['experience_level'] ?? '';
        $prompt = $payload['prompt'] ?? '';
        $currentSkills = implode(', ', $payload['current_skills'] ?? []);
        $requiredSkills = implode(', ', $payload['required_skills'] ?? []);
        $skillGaps = implode(', ', $payload['skill_gaps'] ?? []);
        $hasPhoto = !empty($payload['has_photo']) ? 'yes' : 'no';

        return <<<PROMPT
You are the "International Resume Architect," an elite AI career consultant and ATS optimization expert.

Task:
1. Analyze the candidate's EXISTING resume text.
2. Find weaknesses against the target role.
3. Rewrite the entire resume into a stronger ATS-optimized international standard version.
4. Rewrite work experience bullets using STAR format.
5. Start bullets with strong action verbs and use quantified placeholders like [ADD METRIC] where exact numbers are missing.
6. Optimize for the target role and required keywords.
7. If a photo is present, provide image-processing instructions to remove the background, use #FFFFFF or #F0F8FF, center the face, and adjust contrast.
8. Choose the best template from:
- TEMPL_CLASSIC_SERIF
- TEMPL_TECH_MINIMAL
- TEMPL_CREATIVE_MODERN
- TEMPL_EXECUTIVE_BOLD
- TEMPL_GLOBAL_PRO

Return ONLY a valid JSON object with this structure:
{
  "meta_data": {
    "recommended_template_id": "",
    "ats_score_forecast": "1-100",
    "image_processing_directive": null,
    "improvement_focus": [],
    "ats_keywords": []
  },
  "resume_data": {
    "personal_info": {
      "full_name": "",
      "professional_title": "",
      "email": "",
      "phone": "",
      "linkedin_url": "",
      "location": "City, Country format",
      "photo_url_placeholder": "processed_photo.jpg"
    },
    "summary": "",
    "skills": {
      "hard_skills": [],
      "soft_skills": [],
      "tools_technologies": []
    },
    "work_experience": [],
    "education": [],
    "languages": [],
    "certifications": []
  }
}

Target Role: {$targetRole}
Industry: {$industry}
Experience Level: {$experienceLevel}
Current Skills Found: {$currentSkills}
Required Skills: {$requiredSkills}
Skill Gaps: {$skillGaps}
Extra Instruction: {$prompt}
Photo provided: {$hasPhoto}

Existing Resume Text:
{$rawResumeText}
PROMPT;
    }

    protected function getFallbackResumeBlueprint(array $payload): array
    {
        $targetRole = $payload['target_role'] ?: 'Professional Candidate';
        $industry = $payload['industry'] ?: 'General';
        $experienceLevel = $payload['experience_level'] ?: 'Mid-Level';
        $hasPhoto = !empty($payload['has_photo']);
        $template = $this->selectResumeTemplate($industry, $targetRole, $experienceLevel);

        return [
            'meta_data' => [
                'recommended_template_id' => $template,
                'ats_score_forecast' => '78',
                'image_processing_directive' => $hasPhoto
                    ? 'Remove existing background, replace with solid #FFFFFF or #F0F8FF, center face, and adjust contrast.'
                    : null,
            ],
            'resume_data' => [
                'personal_info' => [
                    'full_name' => '',
                    'professional_title' => $targetRole,
                    'email' => '',
                    'phone' => '',
                    'linkedin_url' => '',
                    'location' => 'City, Country',
                    'photo_url_placeholder' => 'processed_photo.jpg',
                ],
                'summary' => "Results-driven {$targetRole} candidate with {$experienceLevel} experience in {$industry}. Delivers structured execution, measurable outcomes, and ATS-aligned positioning for international opportunities.",
                'skills' => [
                    'hard_skills' => [$targetRole, 'Problem Solving', 'Process Improvement'],
                    'soft_skills' => ['Communication', 'Leadership', 'Collaboration'],
                    'tools_technologies' => ['Excel', 'Google Workspace', 'Project Tracking Tools'],
                ],
                'work_experience' => [[
                    'company' => 'Previous Employer',
                    'role' => $targetRole,
                    'location' => 'City, Country',
                    'duration' => 'Jan 2022 – Present',
                    'achievements' => [
                        "Spearheaded core {$targetRole} initiatives to improve delivery speed by [ADD METRIC], aligning execution with business goals.",
                        "Optimized daily workflows by introducing structured processes, reducing manual effort by [ADD METRIC] and improving team productivity.",
                    ],
                ]],
                'education' => [[
                    'degree' => 'Bachelor Degree',
                    'institution' => 'University Name',
                    'year' => '2024',
                    'gpa_or_honors' => '',
                ]],
                'languages' => ['English (Professional Working Proficiency)'],
                'certifications' => [],
            ],
        ];
    }

    protected function selectResumeTemplate(string $industry, string $targetRole, string $experienceLevel): string
    {
        $haystack = strtolower($industry . ' ' . $targetRole . ' ' . $experienceLevel);

        if (str_contains($haystack, 'finance') || str_contains($haystack, 'law')) {
            return 'TEMPL_CLASSIC_SERIF';
        }

        if (str_contains($haystack, 'software') || str_contains($haystack, 'data') || str_contains($haystack, 'developer')) {
            return 'TEMPL_TECH_MINIMAL';
        }

        if (str_contains($haystack, 'design') || str_contains($haystack, 'marketing') || str_contains($haystack, 'media')) {
            return 'TEMPL_CREATIVE_MODERN';
        }

        if (str_contains($haystack, 'director') || str_contains($haystack, 'executive') || str_contains($haystack, 'c-suite')) {
            return 'TEMPL_EXECUTIVE_BOLD';
        }

        return 'TEMPL_GLOBAL_PRO';
    }

    protected function withAtsBreakdown(array $payload): array
    {
        $resumeData = $payload['resume_data'] ?? [];
        $skills = $resumeData['skills'] ?? [];
        $experience = $resumeData['work_experience'] ?? [];
        $summary = trim((string) ($resumeData['summary'] ?? ''));
        $education = $resumeData['education'] ?? [];

        $keywordCoverage = min(25, count($skills['hard_skills'] ?? []) * 3 + count($skills['tools_technologies'] ?? []) * 2);
        $experienceStrength = min(30, count($experience) * 10 + $this->countAchievements($experience) * 2);
        $structureQuality = 0;
        $structureQuality += $summary !== '' ? 15 : 0;
        $structureQuality += !empty($education) ? 10 : 0;
        $structureQuality += !empty($resumeData['personal_info']['email']) ? 5 : 0;
        $structureQuality += !empty($resumeData['personal_info']['linkedin_url']) ? 5 : 0;
        $formattingReadiness = 10;

        $total = min(100, $keywordCoverage + $experienceStrength + $structureQuality + $formattingReadiness);

        $payload['meta_data']['ats_score_forecast'] = (string) $total;
        $payload['meta_data']['ats_breakdown'] = [
            'keyword_coverage' => $keywordCoverage,
            'experience_strength' => $experienceStrength,
            'structure_quality' => $structureQuality,
            'formatting_readiness' => $formattingReadiness,
        ];

        return $payload;
    }

    protected function countAchievements(array $experience): int
    {
        $count = 0;

        foreach ($experience as $item) {
            $count += count($item['achievements'] ?? []);
        }

        return $count;
    }

    protected function mapLanguageToYoutubeCode(string $language): string
    {
        return match (strtolower($language)) {
            'urdu' => 'ur',
            'hindi' => 'hi',
            'arabic' => 'ar',
            'turkish' => 'tr',
            default => 'en',
        };
    }

    protected function formatYoutubeDuration(string $duration): string
    {
        try {
            $interval = new DateInterval($duration);
        } catch (\Exception $e) {
            return 'varies';
        }

        $hours = ($interval->d * 24) + $interval->h;
        $minutes = $interval->i;

        if ($hours > 0) {
            return trim($hours . ' hr ' . ($minutes > 0 ? $minutes . ' min' : ''));
        }

        if ($minutes > 0) {
            return $minutes . ' min';
        }

        return max(1, $interval->s) . ' sec';
    }
}
