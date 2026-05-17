<?php

namespace Database\Seeders;

use App\Models\Certificate;
use App\Models\Progress;
use App\Models\Roadmap;
use App\Models\User;
use App\Models\UserStats;
use Illuminate\Database\Seeder;

class DemoLearningSeeder extends Seeder
{
    /**
     * Seed realistic learning data for testing weekly insights and progress UI.
     */
    public function run(): void
    {
        $user = User::updateOrCreate(
            ['email' => 'demo@nextstep.ai'],
            [
                'name' => 'Demo Learner',
                'password' => 'password123',
                'role' => 'user',
            ]
        );

        $frontendRoadmap = Roadmap::updateOrCreate(
            [
                'user_id' => (string) $user->_id,
                'target_role' => 'Frontend Developer',
            ],
            [
                'description' => 'Become job-ready as a frontend developer with React and modern UI skills.',
                'current_skills' => ['HTML', 'CSS', 'JavaScript Basics'],
                'skill_gaps' => ['React', 'State Management', 'Testing', 'Responsive Design'],
                'language' => 'English',
                'status' => 'active',
                'nodes' => [
                    ['id' => 1, 'skill_name' => 'React Fundamentals', 'title' => 'Learn React basics', 'description' => 'Components, props, state, and events.', 'estimated_time' => '4 days', 'level' => 'Beginner', 'order' => 1],
                    ['id' => 2, 'skill_name' => 'Responsive Design', 'title' => 'Build responsive layouts', 'description' => 'Mobile-first layout, breakpoints, and adaptive patterns.', 'estimated_time' => '3 days', 'level' => 'Beginner', 'order' => 2],
                    ['id' => 3, 'skill_name' => 'State Management', 'title' => 'Handle app state', 'description' => 'Context, stores, and predictable state flow.', 'estimated_time' => '5 days', 'level' => 'Intermediate', 'order' => 3],
                    ['id' => 4, 'skill_name' => 'Frontend Testing', 'title' => 'Test UI behavior', 'description' => 'Unit and integration testing for components.', 'estimated_time' => '4 days', 'level' => 'Intermediate', 'order' => 4],
                ],
            ]
        );

        $backendRoadmap = Roadmap::updateOrCreate(
            [
                'user_id' => (string) $user->_id,
                'target_role' => 'Backend Developer',
            ],
            [
                'description' => 'Strengthen Laravel backend skills and API design for production work.',
                'current_skills' => ['PHP Basics', 'Git'],
                'skill_gaps' => ['Laravel APIs', 'Authentication', 'Caching'],
                'language' => 'Urdu',
                'status' => 'active',
                'nodes' => [
                    ['id' => 1, 'skill_name' => 'Laravel Routing', 'title' => 'Create maintainable routes', 'description' => 'Build clean web and API routes.', 'estimated_time' => '2 days', 'level' => 'Beginner', 'order' => 1],
                    ['id' => 2, 'skill_name' => 'REST API Design', 'title' => 'Design practical APIs', 'description' => 'Resource design, validation, and JSON responses.', 'estimated_time' => '4 days', 'level' => 'Intermediate', 'order' => 2],
                    ['id' => 3, 'skill_name' => 'Sanctum Authentication', 'title' => 'Secure API access', 'description' => 'Token auth and protected endpoints.', 'estimated_time' => '3 days', 'level' => 'Intermediate', 'order' => 3],
                ],
            ]
        );

        Progress::updateOrCreate(
            [
                'user_id' => (string) $user->_id,
                'roadmap_id' => (string) $frontendRoadmap->_id,
            ],
            [
                'completed_nodes' => ['1', '2'],
                'videos_watched' => ['dQw4w9WgXcQ', 'M7lc1UVf-VE', 'ysz5S6PUM-U'],
                'passed_quizzes' => ['dQw4w9WgXcQ'],
                'node_activity' => [
                    [
                        'node_id' => '1',
                        'skill_name' => 'React Fundamentals',
                        'title' => 'Learn React basics',
                        'completed_at' => now()->subDays(2)->toIso8601String(),
                    ],
                    [
                        'node_id' => '2',
                        'skill_name' => 'Responsive Design',
                        'title' => 'Build responsive layouts',
                        'completed_at' => now()->subDay()->toIso8601String(),
                    ],
                ],
                'status' => 'in_progress',
                'started_at' => now()->subDays(6),
                'completed_at' => null,
            ]
        );

        Progress::updateOrCreate(
            [
                'user_id' => (string) $user->_id,
                'roadmap_id' => (string) $backendRoadmap->_id,
            ],
            [
                'completed_nodes' => ['1'],
                'videos_watched' => ['aqz-KE-bpKQ'],
                'passed_quizzes' => [],
                'node_activity' => [
                    [
                        'node_id' => '1',
                        'skill_name' => 'Laravel Routing',
                        'title' => 'Create maintainable routes',
                        'completed_at' => now()->subDays(4)->toIso8601String(),
                    ],
                ],
                'status' => 'in_progress',
                'started_at' => now()->subDays(8),
                'completed_at' => null,
            ]
        );

        UserStats::updateOrCreate(
            ['user_id' => (string) $user->_id],
            [
                'xp' => 240,
                'level' => 3,
                'streak' => 5,
                'last_active' => now(),
                'badges' => ['Fast Starter', 'Weekly Learner'],
            ]
        );

        Certificate::updateOrCreate(
            [
                'user_id' => (string) $user->_id,
                'roadmap_id' => (string) $frontendRoadmap->_id,
            ],
            [
                'issued_at' => now()->subHours(12),
            ]
        );
    }
}
