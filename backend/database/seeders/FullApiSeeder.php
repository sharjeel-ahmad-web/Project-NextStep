<?php

namespace Database\Seeders;

use App\Models\Certificate;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\Progress;
use App\Models\Quiz;
use App\Models\Resume;
use App\Models\Roadmap;
use App\Models\User;
use App\Models\UserStats;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class FullApiSeeder extends Seeder
{
    /**
     * Seed all database collections for API testing.
     */
    public function run(): void
    {
        // 1. Create Users
        $admin = User::updateOrCreate(
            ['email' => 'admin@nextstep.ai'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password123'),
                'role' => 'admin',
            ]
        );

        $user = User::updateOrCreate(
            ['email' => 'demo@nextstep.ai'],
            [
                'name' => 'Demo Learner',
                'password' => Hash::make('password123'),
                'role' => 'user',
            ]
        );

        // 2. Create Resume for Demo User
        Resume::updateOrCreate(
            ['user_id' => (string) $user->_id],
            [
                'target_role' => 'Software Engineer',
                'industry' => 'Technology',
                'experience_level' => 'Mid-Level',
                'meta_data' => [
                    'recommended_template_id' => 'TEMPL_TECH_MINIMAL',
                    'ats_score_forecast' => '85',
                ],
                'resume_data' => [
                    'personal_info' => [
                        'full_name' => 'Demo Learner',
                        'professional_title' => 'Software Engineer',
                        'email' => 'demo@nextstep.ai',
                        'phone' => '+1234567890',
                        'location' => 'San Francisco, CA',
                    ],
                    'summary' => 'Passionate Software Engineer with 3 years of experience building web applications.',
                    'skills' => [
                        'hard_skills' => ['JavaScript', 'PHP', 'React', 'Laravel'],
                        'soft_skills' => ['Communication', 'Teamwork'],
                        'tools_technologies' => ['Git', 'Docker', 'MongoDB'],
                    ],
                    'work_experience' => [
                        [
                            'company' => 'Tech Corp',
                            'role' => 'Frontend Developer',
                            'location' => 'San Francisco, CA',
                            'duration' => '2021 - Present',
                            'achievements' => [
                                'Developed responsive web applications using React.',
                                'Improved page load speed by 20%.',
                            ],
                        ]
                    ],
                    'education' => [
                        [
                            'degree' => 'BSc Computer Science',
                            'institution' => 'University of Tech',
                            'year' => '2021',
                        ]
                    ],
                ]
            ]
        );

        // 3. Create Courses and Lessons
        $course1 = Course::updateOrCreate(
            ['title' => 'Fullstack React & Laravel Masterclass'],
            [
                'description' => 'Learn to build complete web applications from scratch.',
                'instructor_id' => (string) $admin->_id,
                'category' => 'Web Development',
                'level' => 'Intermediate',
                'duration_hours' => 25,
                'price' => 49.99,
                'image_url' => 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
                'is_published' => true,
            ]
        );

        Lesson::updateOrCreate(
            ['course_id' => (string) $course1->_id, 'title' => 'Introduction to React'],
            [
                'description' => 'Setting up the environment and creating your first component.',
                'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                'duration_minutes' => 15,
                'order' => 1,
            ]
        );

        Lesson::updateOrCreate(
            ['course_id' => (string) $course1->_id, 'title' => 'Laravel API Basics'],
            [
                'description' => 'Creating RESTful endpoints in Laravel.',
                'video_url' => 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
                'duration_minutes' => 20,
                'order' => 2,
            ]
        );

        // 4. Enroll User in Course
        Enrollment::updateOrCreate(
            ['user_id' => (string) $user->_id, 'course_id' => (string) $course1->_id],
            [
                'enrolled_at' => now(),
                'progress_percentage' => 50,
                'status' => 'active',
            ]
        );

        // 5. Create Roadmaps
        $frontendRoadmap = Roadmap::updateOrCreate(
            [
                'user_id' => (string) $user->_id,
                'target_role' => 'Frontend Developer',
            ],
            [
                'description' => 'Become job-ready as a frontend developer with React.',
                'current_skills' => ['HTML', 'CSS', 'JavaScript'],
                'skill_gaps' => ['React', 'State Management'],
                'language' => 'English',
                'status' => 'active',
                'nodes' => [
                    ['id' => 1, 'skill_name' => 'React Fundamentals', 'title' => 'Learn React basics', 'description' => 'Components and props.', 'estimated_time' => '4 days', 'level' => 'Beginner', 'order' => 1],
                    ['id' => 2, 'skill_name' => 'State Management', 'title' => 'Handle app state', 'description' => 'Context and Redux.', 'estimated_time' => '5 days', 'level' => 'Intermediate', 'order' => 2],
                ],
            ]
        );

        // 6. Create Progress for Roadmap
        Progress::updateOrCreate(
            [
                'user_id' => (string) $user->_id,
                'roadmap_id' => (string) $frontendRoadmap->_id,
            ],
            [
                'completed_nodes' => ['1'],
                'videos_watched' => ['dQw4w9WgXcQ'],
                'passed_quizzes' => [],
                'node_activity' => [
                    [
                        'node_id' => '1',
                        'skill_name' => 'React Fundamentals',
                        'title' => 'Learn React basics',
                        'completed_at' => now()->subDays(2)->toIso8601String(),
                    ],
                ],
                'status' => 'in_progress',
                'started_at' => now()->subDays(6),
                'completed_at' => null,
            ]
        );

        // 7. Create Quizzes
        Quiz::updateOrCreate(
            ['video_id' => 'dQw4w9WgXcQ'],
            [
                'video_title' => 'Introduction to React',
                'skill_name' => 'React Fundamentals',
                'questions' => [
                    [
                        'question' => 'What is a component in React?',
                        'options' => ['A function or class that returns HTML', 'A database table', 'A CSS style', 'A server route'],
                        'correct_answer' => 'A function or class that returns HTML',
                        'explanation' => 'Components are the building blocks of React applications.',
                    ],
                    [
                        'question' => 'What is JSX?',
                        'options' => ['JavaScript XML', 'Java Syntax Extension', 'JSON X', 'JavaScript X'],
                        'correct_answer' => 'JavaScript XML',
                        'explanation' => 'JSX allows writing HTML in React.',
                    ]
                ]
            ]
        );

        // 8. Create User Stats
        UserStats::updateOrCreate(
            ['user_id' => (string) $user->_id],
            [
                'xp' => 500,
                'level' => 5,
                'streak' => 7,
                'last_active' => now(),
                'badges' => ['Fast Starter', 'React Beginner'],
            ]
        );

        // 9. Create Certificate
        Certificate::updateOrCreate(
            [
                'user_id' => (string) $user->_id,
                'roadmap_id' => (string) $frontendRoadmap->_id,
            ],
            [
                'issued_at' => now()->subHours(24),
            ]
        );
    }
}
