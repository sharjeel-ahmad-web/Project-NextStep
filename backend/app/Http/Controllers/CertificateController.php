<?php

namespace App\Http\Controllers;

use App\Models\Certificate;
use App\Models\Progress;
use App\Models\Roadmap;
use App\Models\UserStats;
use Illuminate\Http\Request;

class CertificateController extends Controller
{
    /**
     * GET /api/certificates  – list user's certificates
     */
    public function index(Request $request)
    {
        $certificates = Certificate::with('roadmap')
            ->where('user_id', (string) $request->user()->_id)
            ->orderBy('issued_at', 'desc')
            ->get();

        return response()->json(['success' => true, 'data' => $certificates]);
    }

    /**
     * POST /api/certificates/generate/{roadmapId}
     */
    public function generate(Request $request, $roadmapId)
    {
        try {
            $userId = (string) $request->user()->_id;

            // Check roadmap exists for user
            $roadmap = Roadmap::where('_id', $roadmapId)
                ->where('user_id', $userId)
                ->first();

            if (!$roadmap) {
                return response()->json(['message' => 'Roadmap not found'], 404);
            }

            if ($existing) {
                // Ensure roadmap is loaded for existing too
                $existing->load('roadmap');
                return response()->json(['success' => true, 'data' => $existing]);
            }

            // Verify completion
            $progress = Progress::where('user_id', $userId)
                ->where('roadmap_id', $roadmapId)
                ->first();

            $completedNodes = $progress->completed_nodes ?? [];
            $allNodeIds     = array_column($roadmap->nodes ?? [], 'id');

            // If no progress or not all nodes complete
            if (!$progress || array_diff($allNodeIds, $completedNodes)) {
                return response()->json([
                    'message' => 'Cannot generate certificate. Roadmap is not yet completed.',
                    'completed_nodes' => count($completedNodes),
                    'total_nodes' => count($allNodeIds)
                ], 400);
            }

            $certificate = Certificate::create([
                'user_id'    => $userId,
                'roadmap_id' => $roadmapId,
                'issued_at'  => now(),
            ]);

            // Load roadmap for the response
            $certificate->load('roadmap');

            // Award XP for certificate
            $stats = UserStats::forUser($userId);
            $stats->addXp(100);

            // Add badge
            $badgeName = "Certified: {$roadmap->target_role}";
            $badges    = $stats->badges ?? [];
            if (!in_array($badgeName, $badges)) {
                $badges[]      = $badgeName;
                $stats->badges = $badges;
                $stats->save();
            }

            return response()->json(['success' => true, 'data' => $certificate], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Certificate generation failed', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * GET /api/certificates/verify/{id}  – public, no auth
     */
    public function verify($id)
    {
        $certificate = Certificate::where('certificate_code', $id)->first();

        if (!$certificate) {
            return response()->json(['valid' => false, 'message' => 'Certificate not found'], 404);
        }

        $roadmap = Roadmap::find($certificate->roadmap_id);
        $user    = \App\Models\User::find($certificate->user_id);

        return response()->json([
            'valid'        => true,
            'certificate'  => [
                'id'           => (string) $certificate->_id,
                'code'         => $certificate->certificate_code,
                'issued_at'    => $certificate->issued_at,
                'target_role'  => $roadmap?->target_role ?? 'Unknown',
                'user_name'    => $user?->name ?? 'Unknown',
                'roadmap_name' => $roadmap?->target_role ?? 'Unknown',
            ],
        ]);
    }

    /**
     * GET /api/certificates/{id}/download
     */
    public function download(Request $request, $id)
    {
        try {
            $userId      = (string) $request->user()->_id;
            $certificate = Certificate::with(['roadmap', 'user'])
                ->where('_id', $id)
                ->where('user_id', $userId)
                ->first();

            if (!$certificate) {
                return response()->json(['message' => 'Certificate not found'], 404);
            }

            $format = $request->query('format', 'pdf');
            $user   = $certificate->user;
            $roadmap = $certificate->roadmap;

            // Prepare data for template
            $data = [
                'user_name'        => $user->name,
                'target_role'      => $roadmap->target_role ?? 'Professional',
                'issued_at'        => $certificate->issued_at->format('F d, Y'),
                'certificate_code' => $certificate->certificate_code,
                'user_avatar'      => $user->avatar ? $this->getLocalAvatarPath($user->avatar) : null,
                'verify_url'       => url("/certificates/verify/{$certificate->certificate_code}"),
            ];


            if ($format === 'docx') {
                return $this->generateDocx($data);
            }

            // Default: PDF
            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('certificates.certificate', $data)
                ->setPaper('a4', 'landscape');

            return $pdf->download("Certificate_{$certificate->certificate_code}.pdf");

        } catch (\Exception $e) {
            return response()->json(['message' => 'Download failed', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Convert avatar URL to local path for DomPDF
     */
    private function getLocalAvatarPath($url)
    {
        $path = str_replace(url('/'), public_path(), $url);
        if (file_exists($path)) {
            return $path;
        }
        return $url; // Fallback to URL
    }

    /**
     * Generate DOCX version (simplified/professional)
     */
    private function generateDocx($data)
    {
        $phpWord = new \PhpOffice\PhpWord\PhpWord();
        $section = $phpWord->addSection([
            'orientation' => 'landscape',
            'marginTop' => 600,
            'marginBottom' => 600,
            'marginLeft' => 600,
            'marginRight' => 600,
        ]);

        $section->addText('NEXTSTEP AI', ['bold' => true, 'size' => 24, 'color' => '0984e3'], ['alignment' => 'center']);
        $section->addTextBreak(1);
        $section->addText('Certificate of Completion', ['bold' => true, 'size' => 36, 'color' => 'f1c40f'], ['alignment' => 'center']);
        $section->addTextBreak(2);
        
        $section->addText('This recognition is proudly presented to', ['size' => 14], ['alignment' => 'center']);
        $section->addText($data['user_name'], ['bold' => true, 'size' => 48], ['alignment' => 'center']);
        $section->addTextBreak(1);
        
        $section->addText("For the successful completion of the {$data['target_role']} professional learning roadmap.", ['size' => 16], ['alignment' => 'center']);
        $section->addTextBreak(2);
        
        $section->addText("Issued on {$data['issued_at']}", ['size' => 14], ['alignment' => 'center']);
        $section->addTextBreak(3);
        
        $section->addText("Verification ID: {$data['certificate_code']}", ['size' => 10, 'italic' => true], ['alignment' => 'center']);

        $filename = "Certificate_{$data['certificate_code']}.docx";
        $tempFile = tempnam(sys_get_temp_dir(), 'phpword');
        $objWriter = \PhpOffice\PhpWord\IOFactory::createWriter($phpWord, 'Word2007');
        $objWriter->save($tempFile);

        return response()->download($tempFile, $filename)->deleteFileAfterSend(true);
    }
}
