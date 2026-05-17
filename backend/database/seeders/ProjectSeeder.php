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
use Illuminate\Support\Str;

class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create Admin & Verified Users
        $admin = User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Sara Admin',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        $user = User::updateOrCreate(
            ['email' => 'user@example.com'],
            [
                'name' => 'John Doe',
                'password' => Hash::make('user123'),
                'role' => 'user',
                'email_verified_at' => now(),
                'skills' => ['JavaScript', 'HTML', 'CSS'],
                'location' => ['city' => 'New York', 'country' => 'USA'],
            ]
        );

        // 2. Create Resume for User
        Resume::updateOrCreate(
            ['user_id' => $user->id],
            [
                'target_role' => 'Fullstack Developer',
                'industry' => 'Tech',
                'experience_level' => 'Entry',
                'resume_data' => [
                    'personal_info' => ['full_name' => 'John Doe', 'email' => 'user@example.com'],
                    'summary' => 'Learning everyday to become a master developer.',
                    'skills' => ['hard_skills' => ['React', 'Node.js', 'MongoDB']],
                ]
            ]
        );

        // 3. Create Courses
        $course = Course::updateOrCreate(
            ['title' => 'Mastering MongoDB with Laravel'],
            [
                'description' => 'A deep dive into using NoSQL with Laravel.',
                'instructor_id' => $admin->id,
                'category' => 'Database',
                'level' => 'Advanced',
                'duration_hours' => 10,
                'price' => 29.99,
                'is_published' => true,
            ]
        );

        // 4. Create Lessons
        $lesson1 = Lesson::updateOrCreate(
            ['course_id' => $course->id, 'title' => 'Setting up the Environment'],
            [
                'description' => 'How to install MongoDB and the Laravel library.',
                'content' => 'First, you need to install the mongodb/laravel-mongodb package...',
                'duration_minutes' => 15,
                'order' => 1,
                'is_published' => true,
            ]
        );

        $lesson2 = Lesson::updateOrCreate(
            ['course_id' => $course->id, 'title' => 'Eloquent with MongoDB'],
            [
                'description' => 'Using standard Eloquent features with MongoDB.',
                'content' => 'Models in MongoDB work almost exactly like standard Eloquent models...',
                'duration_minutes' => 25,
                'order' => 2,
                'is_published' => true,
            ]
        );

        // 5. Create Quiz
        Quiz::updateOrCreate(
            ['video_id' => 'intro_mongo_123'], // Mock video ID
            [
                'video_title' => 'Setting up the Environment',
                'skill_name' => 'MongoDB Basics',
                'questions' => [
                    [
                        'question' => 'Which driver is used for MongoDB in Laravel?',
                        'options' => ['PDO', 'MongoDB Driver', 'SQLite', 'Redis'],
                        'correct_answer' => 'MongoDB Driver',
                        'explanation' => 'The MongoDB driver is required for the PHP extension to communicate with the DB.',
                    ]
                ]
            ]
        );

        // 6. Create Roadmaps
        $backendRoadmap = Roadmap::updateOrCreate(
            ['user_id' => $user->id, 'target_role' => 'Backend Engineer'],
            [
                'description' => 'The path to becoming a powerful backend developer.',
                'status' => 'active',
                'nodes' => [
                    ['id' => 'node1', 'title' => 'PHP Foundations', 'skill_name' => 'PHP', 'order' => 1],
                    ['id' => 'node2', 'title' => 'Laravel Framework', 'skill_name' => 'Laravel', 'order' => 2],
                ]
            ]
        );

        $fullstackRoadmap = Roadmap::updateOrCreate(
            ['user_id' => $user->id, 'target_role' => 'Fullstack Architect'],
            [
                'description' => 'Already mastered. See your certificate!',
                'status' => 'completed',
                'nodes' => [
                    ['id' => 'fs1', 'title' => 'Web Core', 'skill_name' => 'Frontend', 'order' => 1],
                ]
            ]
        );

        // 7. Progress & Stats
        Progress::updateOrCreate(
            ['user_id' => $user->id, 'roadmap_id' => $backendRoadmap->id],
            [
                'completed_nodes' => ['node1'],
                'status' => 'in_progress',
                'started_at' => now()->subDays(10),
            ]
        );

        UserStats::updateOrCreate(
            ['user_id' => $user->id],
            [
                'xp' => 1250,
                'level' => 12,
                'streak' => 15,
                'last_active' => now(),
                'badges' => ['Bug Hunter', 'Fast Learner', 'MongoDB Master'],
            ]
        );

        // 8. Certificates
        Certificate::updateOrCreate(
            ['user_id' => $user->id, 'roadmap_id' => $fullstackRoadmap->id],
            ['issued_at' => now()->subMonths(1)]
        );

        $this->command->info('Project successfully seeded with test data!');
    }
}
