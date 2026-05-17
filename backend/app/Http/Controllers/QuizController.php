<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\Progress;
use App\Models\UserStats;
use App\Services\GeminiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class QuizController extends Controller
{
    protected GeminiService $geminiService;

    public function __construct(GeminiService $geminiService)
    {
        $this->geminiService = $geminiService;
    }

    /**
     * GET /api/quiz
     * Fetch or generate quiz for a video
     */
    public function getQuiz(Request $request)
    {
        try {
            $request->validate([
                'video_id'    => 'required|string',
                'video_title' => 'required|string',
                'skill_name'  => 'required|string',
            ]);

            $videoId    = $request->query('video_id');
            $videoTitle = $request->query('video_title');
            $skillName  = $request->query('skill_name');

            $quiz = Quiz::where('video_id', $videoId)->first();

            if (!$quiz) {
                $questions = $this->geminiService->generateQuiz($videoTitle, $skillName);
                
                if (empty($questions)) {
                    return response()->json(['message' => 'AI failed to generate quiz. Please try again.'], 500);
                }

                $quiz = Quiz::create([
                    'video_id'    => $videoId,
                    'video_title' => $videoTitle,
                    'skill_name'  => $skillName,
                    'questions'   => $questions
                ]);
            }

            // Remove correct answers before sending to frontend
            $safeQuestions = array_map(function($q) {
                unset($q['correct_answer']);
                unset($q['explanation']);
                return $q;
            }, $quiz->questions);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $quiz->_id,
                    'questions' => $safeQuestions
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Quiz Controler error: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to fetch quiz'], 500);
        }
    }

    /**
     * POST /api/quiz/submit
     */
    public function submitQuiz(Request $request)
    {
        try {
            $request->validate([
                'quiz_id'     => 'required|string',
                'answers'     => 'required|array', // index => answer string
                'progress_id' => 'required|string',
                'node_id'     => 'required'
            ]);

            $quizId     = $request->input('quiz_id');
            $answers    = $request->input('answers');
            $progressId = $request->input('progress_id');
            $nodeId     = $request->input('node_id');

            $quiz = Quiz::find($quizId);
            if (!$quiz) {
                return response()->json(['message' => 'Quiz not found'], 404);
            }

            $results = [];
            $score   = 0;
            $total   = count($quiz->questions);

            foreach ($quiz->questions as $index => $q) {
                $userAnswer = $answers[$index] ?? '';
                $isCorrect  = ($userAnswer === $q['correct_answer']);
                
                if ($isCorrect) $score++;

                $results[] = [
                    'question'       => $q['question'],
                    'user_answer'    => $userAnswer,
                    'correct_answer' => $q['correct_answer'],
                    'explanation'    => $q['explanation'],
                    'is_correct'     => $isCorrect
                ];
            }

            $percentage = ($score / $total) * 100;
            $passed     = ($percentage >= 70);

            if ($passed) {
                $progress = Progress::where('_id', $progressId)
                    ->where('user_id', (string) $request->user()->_id)
                    ->first();

                if ($progress) {
                    $passedQuizzes = $progress->passed_quizzes ?? [];
                    if (!in_array($quiz->video_id, $passedQuizzes)) {
                        $passedQuizzes[] = $quiz->video_id;
                        $progress->passed_quizzes = $passedQuizzes;
                        $progress->save();

                        // Award XP for passing quiz
                        $stats = UserStats::forUser((string) $request->user()->_id);
                        $stats->addXp(30);
                    }
                }
            }

            return response()->json([
                'success'    => true,
                'data' => [
                    'score'      => $score,
                    'total'      => $total,
                    'percentage' => $percentage,
                    'passed'     => $passed,
                    'results'    => $results
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Quiz Submission error: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to submit quiz'], 500);
        }
    }
}
