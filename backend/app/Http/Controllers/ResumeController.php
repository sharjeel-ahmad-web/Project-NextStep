<?php

namespace App\Http\Controllers;

use App\Models\Resume;
use App\Services\GeminiService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\PhpWord;
use Smalot\PdfParser\Parser;

class ResumeController extends Controller
{
    public function __construct(protected GeminiService $geminiService)
    {
    }

    public function index(Request $request)
    {
        $resumes = Resume::where('user_id', (string) $request->user()->_id)
            ->orderBy('updated_at', 'desc')
            ->get();

        return response()->json($resumes);
    }

    public function show(Request $request, string $id)
    {
        $resume = $this->findUserResume($request, $id);

        if (!$resume) {
            return response()->json(['message' => 'Resume not found'], 404);
        }

        return response()->json($resume);
    }

    public function generate(Request $request)
    {
        $validated = $request->validate([
            'prompt' => 'required|string|min:10|max:5000',
            'target_role' => 'nullable|string|max:255',
            'industry' => 'nullable|string|max:255',
            'experience_level' => 'nullable|string|max:255',
            'raw_input' => 'nullable|string|max:12000',
            'has_photo' => 'nullable|boolean',
        ]);

        $hasPhoto = (bool) ($validated['has_photo'] ?? false);
        $photoUrl = $request->user()->avatar ?? null;

        $generated = $this->geminiService->generateResumeBlueprint([
            'prompt' => $validated['prompt'],
            'target_role' => $validated['target_role'] ?? '',
            'industry' => $validated['industry'] ?? '',
            'experience_level' => $validated['experience_level'] ?? '',
            'raw_input' => $validated['raw_input'] ?? $validated['prompt'],
            'has_photo' => $hasPhoto || !empty($photoUrl),
        ]);

        $resumeData = $generated['resume_data'] ?? [];
        $metaData = $generated['meta_data'] ?? [];

        if (!empty($photoUrl)) {
            $resumeData['personal_info']['photo_url_placeholder'] = $photoUrl;
        }

        $resume = Resume::create([
            'user_id' => (string) $request->user()->_id,
            'title' => data_get($resumeData, 'personal_info.professional_title', $validated['target_role'] ?? 'Professional Resume'),
            'target_role' => $validated['target_role'] ?? data_get($resumeData, 'personal_info.professional_title', 'Professional Resume'),
            'industry' => $validated['industry'] ?? null,
            'experience_level' => $validated['experience_level'] ?? null,
            'raw_prompt' => $validated['prompt'],
            'raw_input' => $validated['raw_input'] ?? $validated['prompt'],
            'photo_url' => $photoUrl,
            'meta_data' => $metaData,
            'resume_data' => $resumeData,
        ]);

        $this->syncUserProfile($request, $resumeData);

        return response()->json($resume, 201);
    }

    public function improveExisting(Request $request)
    {
        $validated = $request->validate([
            'resume' => 'required|file|mimes:pdf|max:10240',
            'target_role' => 'required|string|max:255',
            'industry' => 'nullable|string|max:255',
            'experience_level' => 'nullable|string|max:255',
            'prompt' => 'nullable|string|max:5000',
        ]);

        $parser = new Parser();
        $pdf = $parser->parseFile($request->file('resume')->getPathname());
        $resumeText = trim($pdf->getText());

        if ($resumeText === '') {
            return response()->json(['message' => 'Could not extract text from the uploaded resume'], 422);
        }

        $analysisPrompt = $validated['prompt'] ?? "Improve this existing resume for the role of {$validated['target_role']}";
        $analysis = $this->geminiService->analyzeSkillGap(
            $resumeText,
            $validated['target_role'],
            $analysisPrompt,
            'English'
        );

        $generated = $this->geminiService->generateImprovedResumeFromExisting([
            'raw_resume_text' => $resumeText,
            'prompt' => $analysisPrompt,
            'target_role' => $validated['target_role'],
            'industry' => $validated['industry'] ?? '',
            'experience_level' => $validated['experience_level'] ?? '',
            'skill_gaps' => $analysis['skill_gaps'] ?? [],
            'required_skills' => $analysis['required_skills'] ?? [],
            'current_skills' => $analysis['current_skills'] ?? [],
            'has_photo' => !empty($request->user()->avatar),
        ]);

        $resumeData = $generated['resume_data'] ?? [];
        $metaData = $generated['meta_data'] ?? [];
        $metaData['identified_skill_gaps'] = $analysis['skill_gaps'] ?? [];
        $metaData['required_skills'] = $analysis['required_skills'] ?? [];
        $metaData['current_skills'] = $analysis['current_skills'] ?? [];
        $metaData['improvement_mode'] = 'existing_resume_upgrade';

        if ($request->user()->avatar) {
            $resumeData['personal_info']['photo_url_placeholder'] = $request->user()->avatar;
        }

        $resume = Resume::create([
            'user_id' => (string) $request->user()->_id,
            'title' => data_get($resumeData, 'personal_info.professional_title', $validated['target_role']),
            'target_role' => $validated['target_role'],
            'industry' => $validated['industry'] ?? null,
            'experience_level' => $validated['experience_level'] ?? null,
            'raw_prompt' => $analysisPrompt,
            'raw_input' => $resumeText,
            'photo_url' => $request->user()->avatar ?? null,
            'meta_data' => $metaData,
            'resume_data' => $resumeData,
        ]);

        $this->syncUserProfile($request, $resumeData);

        return response()->json([
            'resume' => $resume,
            'gap_analysis' => $analysis,
        ], 201);
    }

    public function update(Request $request, string $id)
    {
        $resume = $this->findUserResume($request, $id);

        if (!$resume) {
            return response()->json(['message' => 'Resume not found'], 404);
        }

        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'target_role' => 'nullable|string|max:255',
            'industry' => 'nullable|string|max:255',
            'experience_level' => 'nullable|string|max:255',
            'meta_data' => 'nullable|array',
            'resume_data' => 'nullable|array',
        ]);

        $resume->update($validated);

        return response()->json($resume->fresh());
    }

    public function uploadPhoto(Request $request, string $id)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg|max:4096',
        ]);

        $resume = $this->findUserResume($request, $id);

        if (!$resume) {
            return response()->json(['message' => 'Resume not found'], 404);
        }

        if ($resume->photo_url) {
            $oldPath = str_replace(url('storage/'), '', $resume->photo_url);
            Storage::disk('public')->delete($oldPath);
        }

        $path = $request->file('image')->store('resume-photos', 'public');
        $photoUrl = url(Storage::url($path));

        $metaData = $resume->meta_data ?? [];
        $resumeData = $resume->resume_data ?? [];
        data_set($resumeData, 'personal_info.photo_url_placeholder', $photoUrl);
        $metaData['image_processing_directive'] = 'Remove existing background, replace it with solid #FFFFFF or #F0F8FF, center face, and adjust contrast.';

        $resume->update([
            'photo_url' => $photoUrl,
            'meta_data' => $metaData,
            'resume_data' => $resumeData,
        ]);

        return response()->json($resume->fresh());
    }

    public function download(Request $request, string $id)
    {
        $resume = $this->findUserResume($request, $id);

        if (!$resume) {
            return response()->json(['message' => 'Resume not found'], 404);
        }

        $format = $request->query('format', 'pdf');
        $data = [
            'resume' => $resume,
            'templateId' => data_get($resume->meta_data, 'recommended_template_id', 'TEMPL_GLOBAL_PRO'),
        ];

        if ($format === 'docx') {
            return $this->generateResumeDocx($resume);
        }

        $pdf = Pdf::loadView('resumes.export', $data)->setPaper('a4', 'portrait');

        return $pdf->download($this->buildFilename($resume, 'pdf'));
    }

    protected function findUserResume(Request $request, string $id): ?Resume
    {
        return Resume::where('_id', $id)
            ->where('user_id', (string) $request->user()->_id)
            ->first();
    }

    protected function generateResumeDocx(Resume $resume)
    {
        $phpWord = new PhpWord();
        $section = $phpWord->addSection([
            'marginTop' => 700,
            'marginBottom' => 700,
            'marginLeft' => 700,
            'marginRight' => 700,
        ]);

        $personal = data_get($resume, 'resume_data.personal_info', []);
        $skills = data_get($resume, 'resume_data.skills', []);
        $experience = data_get($resume, 'resume_data.work_experience', []);
        $education = data_get($resume, 'resume_data.education', []);

        $section->addText($personal['full_name'] ?? 'Professional Candidate', ['bold' => true, 'size' => 22], ['alignment' => 'center']);
        $section->addText($personal['professional_title'] ?? ($resume->target_role ?? 'Professional Resume'), ['size' => 14], ['alignment' => 'center']);
        $section->addText(trim(($personal['email'] ?? '') . ' | ' . ($personal['phone'] ?? '') . ' | ' . ($personal['linkedin_url'] ?? '')), ['size' => 10], ['alignment' => 'center']);
        $section->addTextBreak(1);

        $section->addText('Professional Summary', ['bold' => true, 'size' => 14]);
        $section->addText(data_get($resume, 'resume_data.summary', ''), ['size' => 11]);
        $section->addTextBreak(1);

        $section->addText('Skills', ['bold' => true, 'size' => 14]);
        $section->addText(implode(', ', array_filter(array_merge($skills['hard_skills'] ?? [], $skills['tools_technologies'] ?? [], $skills['soft_skills'] ?? []))), ['size' => 11]);
        $section->addTextBreak(1);

        $section->addText('Experience', ['bold' => true, 'size' => 14]);
        foreach ($experience as $item) {
            $section->addText(($item['role'] ?? '') . ' - ' . ($item['company'] ?? ''), ['bold' => true, 'size' => 12]);
            $section->addText(($item['location'] ?? '') . ' | ' . ($item['duration'] ?? ''), ['italic' => true, 'size' => 10]);
            foreach (($item['achievements'] ?? []) as $achievement) {
                $section->addListItem($achievement, 0, ['size' => 11]);
            }
            $section->addTextBreak(1);
        }

        $section->addText('Education', ['bold' => true, 'size' => 14]);
        foreach ($education as $item) {
            $line = trim(($item['degree'] ?? '') . ' - ' . ($item['institution'] ?? ''));
            $section->addText($line, ['bold' => true, 'size' => 12]);
            $section->addText(trim(($item['year'] ?? '') . ' ' . ($item['gpa_or_honors'] ?? '')), ['size' => 10]);
        }

        $filename = $this->buildFilename($resume, 'docx');
        $tempFile = tempnam(sys_get_temp_dir(), 'resume_docx');
        $writer = IOFactory::createWriter($phpWord, 'Word2007');
        $writer->save($tempFile);

        return response()->download($tempFile, $filename)->deleteFileAfterSend(true);
    }

    protected function buildFilename(Resume $resume, string $extension): string
    {
        $base = str($resume->target_role ?: 'resume')->slug('_');
        return $base . '_resume.' . $extension;
    }

    protected function syncUserProfile(Request $request, array $resumeData): void
    {
        $user = $request->user();

        $domain = data_get($resumeData, 'personal_info.professional_title')
            ?: data_get($resumeData, 'summary');

        $skills = array_filter(array_unique(array_merge(
            data_get($resumeData, 'skills.hard_skills', []),
            data_get($resumeData, 'skills.tools_technologies', []),
            data_get($resumeData, 'skills.soft_skills', [])
        )));

        if ($domain) {
            $user->domain = $domain;
        }

        if (!empty($skills)) {
            $user->skills = array_values($skills);
        }

        $user->save();
    }
}
