<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Http;

try {
    $apiKey = config('services.gemini.key', env('GEMINI_API_KEY'));
    $endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';
    
    $prompt = "You are an expert career advisor and technical recruiter. 
            Analyze the following resume text against the target role and the user's personal goal.
            
            Target Role: Frontend Developer
            User's Goal/Description: I want to be a React developer.
            Preferred Learning Language: English
            
            Resume Text:
            My resume says I know HTML and CSS.
            
            Identify:
            1. Current Skills (found in resume that are relevant to the role)
            2. Required Skills (standard industry requirements for this role)
            3. Skill Gaps (required skills missing or weak in the resume)
            
            Return ONLY a valid JSON object with these keys: 'current_skills' (array), 'required_skills' (array), 'skill_gaps' (array).";

    $response = Http::post("{$endpoint}?key={$apiKey}", [
        'contents' => [
            [
                'parts' => [
                    ['text' => $prompt]
                ]
            ]
        ]
    ]);
    
    echo "Status: " . $response->status() . "\n";
    echo "Body:\n" . $response->body() . "\n";
    
    $content = $response->json();
    $text = $content['candidates'][0]['content']['parts'][0]['text'] ?? '';
    
    echo "Raw text from Gemini:\n";
    var_dump($text);
} catch (\Exception $e) {
    echo "ERROR:\n";
    echo $e->getMessage();
}
