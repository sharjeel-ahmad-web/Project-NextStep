<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Http;

try {
    $response = Http::post("http://localhost:8000/api/auth/register", [
        "name" => "Test User",
        "email" => "test1@example.com",
        "password" => "password",
        "password_confirmation" => "password"
    ]);
    
    echo "Status: " . $response->status() . "\n";
    echo "Body:\n" . $response->body() . "\n";
} catch (\Exception $e) {
    echo "ERROR:\n";
    echo $e->getMessage();
}
