<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\LessonController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SkillGapController;
use App\Http\Controllers\RoadmapController;
use App\Http\Controllers\ProgressController;
use App\Http\Controllers\CertificateController;
use App\Http\Controllers\GamificationController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ResumeController;
use App\Http\Controllers\QuizController;

// ============================================================
// PUBLIC Routes (no authentication required)
// ============================================================

// Health check
Route::get('/health', function () {
    return response()->json([
        'status'    => 'ok',
        'timestamp' => now(),
        'database'  => 'mongodb',
        'message'   => 'Backend API is running with MongoDB',
    ]);
});

// Auth - Public
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password',  [AuthController::class, 'resetPassword']);
    Route::get('/verify-email/{id}/{hash}', [AuthController::class, 'verifyEmail'])->name('verification.verify');
    Route::get('/google',          [AuthController::class, 'googleRedirect']);
    Route::get('/google/callback', [AuthController::class, 'googleCallback']);
});


// Public certificate verification
Route::get('/certificates/verify/{id}', [CertificateController::class, 'verify']);

// Courses - Public read access
Route::prefix('courses')->group(function () {
    Route::get('/',      [CourseController::class, 'index']);
    Route::get('/{id}',  [CourseController::class, 'show']);
});

// ============================================================
// PROTECTED Routes (Sanctum token required)
// ============================================================
Route::middleware('auth:sanctum')->group(function () {

    // Auth - Protected
    Route::prefix('auth')->group(function () {
        Route::get('/me',       [AuthController::class, 'me']);
        Route::post('/logout',  [AuthController::class, 'logout']);
        Route::post('/refresh', [AuthController::class, 'refresh']);
        Route::post('/email/verification-notification', [AuthController::class, 'resendVerification']);
    });

    // Skill Gap Analysis
    Route::post('/skill-gap/analyze', [SkillGapController::class, 'analyze']);

    // Profile Management
    Route::prefix('profile')->group(function () {
        Route::put('/', [ProfileController::class, 'update']);
        Route::post('/avatar', [ProfileController::class, 'uploadAvatar']);
        Route::delete('/avatar', [ProfileController::class, 'deleteAvatar']);
        Route::post('/location', [ProfileController::class, 'saveLocation']);
    });

    // Roadmaps
    Route::prefix('roadmaps')->group(function () {
        Route::get('/',           [RoadmapController::class, 'index']);
        Route::post('/generate',  [RoadmapController::class, 'generate']);
        Route::get('/{id}',       [RoadmapController::class, 'show']);
        Route::delete('/{id}',    [RoadmapController::class, 'destroy']);
        Route::get('/{id}/videos',[RoadmapController::class, 'getVideos']);
    });

    // Resume Builder
    Route::prefix('resumes')->group(function () {
        Route::get('/', [ResumeController::class, 'index']);
        Route::post('/generate', [ResumeController::class, 'generate']);
        Route::post('/improve-existing', [ResumeController::class, 'improveExisting']);
        Route::get('/{id}', [ResumeController::class, 'show']);
        Route::get('/{id}/download', [ResumeController::class, 'download']);
        Route::put('/{id}', [ResumeController::class, 'update']);
        Route::post('/{id}/photo', [ResumeController::class, 'uploadPhoto']);
    });

    // Progress Tracking
    Route::prefix('progress')->group(function () {
        Route::post('/start',              [ProgressController::class, 'start']);
        Route::post('/{id}/complete',      [ProgressController::class, 'complete']);
        Route::post('/{id}/track-video',   [ProgressController::class, 'trackVideo']);
        Route::post('/{id}/practice-task', [ProgressController::class, 'updatePracticeTask']);
        Route::post('/{id}/practice-submission', [ProgressController::class, 'uploadPracticeSubmission']);
        Route::get('/roadmap/{roadmapId}', [ProgressController::class, 'getRoadmapProgress']);
        Route::get('/weekly-insights',     [ProgressController::class, 'getWeeklyInsights']);
    });

    // Certificates
    Route::prefix('certificates')->group(function () {
        Route::get('/',                   [CertificateController::class, 'index']);
        Route::post('/generate/{roadmapId}', [CertificateController::class, 'generate']);
        Route::get('/{id}/download',      [CertificateController::class, 'download']);
    });

    // Gamification
    Route::prefix('gamification')->group(function () {
        Route::get('/leaderboard', [GamificationController::class, 'getLeaderboard']);
        Route::get('/badges',      [GamificationController::class, 'getBadges']);
        Route::get('/stats',       [GamificationController::class, 'getStats']);
    });

    // Admin
    Route::prefix('admin')->group(function () {
        Route::get('/users', [AdminController::class, 'getUsers']);
        Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);
        Route::patch('/users/{id}/role', [AdminController::class, 'updateRole']);
        Route::get('/stats', [AdminController::class, 'getStats']);
        Route::get('/practice-reviews', [AdminController::class, 'getPracticeReviews']);
        Route::post('/practice-reviews/{progressId}', [AdminController::class, 'reviewPracticeTask']);
        Route::delete('/certificates/{id}', [AdminController::class, 'deleteCertificate']);
        
        // Admin Course Management
        Route::post('/courses',     [CourseController::class, 'store']);
        Route::put('/courses/{id}',  [CourseController::class, 'update']);
        Route::delete('/courses/{id}', [CourseController::class, 'destroy']);
        
        // Admin Lesson Management
        Route::post('/courses/{courseId}/lessons', [LessonController::class, 'store']);
        Route::put('/lessons/{id}',  [LessonController::class, 'update']);
        Route::delete('/lessons/{id}', [LessonController::class, 'destroy']);
    });

    // ============ QUIZ ROUTES ============
    Route::get('/quiz', [QuizController::class, 'getQuiz']);
    Route::post('/quiz/submit', [QuizController::class, 'submitQuiz']);
});
