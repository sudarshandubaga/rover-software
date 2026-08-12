<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Seed the application's default admin user.
     */
    public function run(): void
    {
        $email = 'admin@roverrajasthan.com';
        $password = 'password';

        User::updateOrCreate(
            ['email' => $email],
            [
                'name' => 'Rover Rajasthan Admin',
                'email' => $email,
                'password' => Hash::make($password),
            ]
        );

        $this->command->info("Admin user ready: {$email} / {$password}");
    }
}
