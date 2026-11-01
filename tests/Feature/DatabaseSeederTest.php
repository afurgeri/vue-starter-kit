<?php

use App\Dashboard\DashboardPermissions;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Modules\Rbac\RbacPermissions;

test('the seeded admin user holds every permission', function () {
    $this->seed(DatabaseSeeder::class);

    $admin = User::query()->where('email', 'admin@example.com')->firstOrFail();

    expect($admin->roles->pluck('name')->all())->toBe(['admin']);

    foreach ([...RbacPermissions::all(), ...DashboardPermissions::all()] as $permission) {
        expect($admin->hasPermission($permission))->toBeTrue();
    }
});

test('running the seeder twice does not duplicate the admin user', function () {
    $this->seed(DatabaseSeeder::class);
    $this->seed(DatabaseSeeder::class);

    expect(User::query()->where('email', 'admin@example.com')->count())->toBe(1);
});
