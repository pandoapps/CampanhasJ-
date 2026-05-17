<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Admin
        User::updateOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'name' => 'Admin Global',
                'password' => Hash::make('123456'),
                'role' => 'admin',
                'status' => 'active',
                'phone' => '(11) 99999-0000',
            ]
        );

        // Candidatos de teste
        $candidates = [
            [
                'name' => 'João Silva',
                'email' => 'candidato1@campanhasja.com',
                'plan' => 'profissional',
            ],
            [
                'name' => 'Maria Luíza',
                'email' => 'candidato2@campanhasja.com',
                'plan' => 'enterprise',
            ],
        ];

        foreach ($candidates as $candidate) {
            User::updateOrCreate(
                ['email' => $candidate['email']],
                [
                    'name' => $candidate['name'],
                    'password' => Hash::make('123456'),
                    'role' => 'candidate',
                    'plan' => $candidate['plan'],
                    'status' => 'active',
                    'phone' => '(11) 98888-7777',
                ]
            );
        }
    }
}
