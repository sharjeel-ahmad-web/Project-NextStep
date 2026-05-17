<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * This specifically only seeds the Admin user.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@nextstep.ai'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password123'),
                'role' => 'admin',
            ]
        );
        
        $this->command->info('Admin user seeded successfully. Email: admin@nextstep.ai | Password: password123');
    }
}
