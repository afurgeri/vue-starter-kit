<?php

use App\Models\User;
use Modules\Rbac\Models\Permission;
use Modules\Rbac\Models\Role;
use Modules\Rbac\RbacPermissions;

function userAllowedToUpdateUsers(): User
{
    $role = Role::query()->create(['name' => 'user-activation-tester']);
    $permission = Permission::query()->create(['name' => RbacPermissions::UPDATE_USERS]);
    $role->permissions()->sync([$permission->getKey()]);

    $user = User::factory()->create();
    $user->roles()->sync([$role->getKey()]);

    return $user;
}

test('new users are active by default', function () {
    $user = User::query()->create([
        'name' => 'Seller',
        'email' => 'seller@example.com',
        'password' => 'password',
    ]);

    expect($user->fresh()->is_active)->toBeTrue();
});

test('an admin can deactivate another user', function () {
    $user = User::factory()->create();

    $this->actingAs(userAllowedToUpdateUsers())
        ->patch(route('users.update', $user), [
            'name' => $user->name,
            'email' => $user->email,
            'is_active' => false,
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('users.index'));

    expect($user->fresh()->is_active)->toBeFalse();
});

test('users cannot deactivate their own account', function () {
    $admin = userAllowedToUpdateUsers();

    $this->actingAs($admin)
        ->patch(route('users.update', $admin), [
            'name' => $admin->name,
            'email' => $admin->email,
            'is_active' => false,
        ])
        ->assertSessionHasErrors(['is_active' => 'You cannot deactivate your own account.']);

    expect($admin->fresh()->is_active)->toBeTrue();
});

test('inactive users cannot log in', function () {
    $user = User::factory()->inactive()->create();

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ])->assertSessionHasErrors(['email' => 'Your account has been deactivated.']);

    $this->assertGuest();
});

test('inactive users with a wrong password get the usual credentials error', function () {
    $user = User::factory()->inactive()->create();

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'wrong-password',
    ])->assertSessionHasErrors(['email' => __('auth.failed')]);

    $this->assertGuest();
});

test('users deactivated during an open session are logged out', function () {
    $user = User::factory()->inactive()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertRedirect(route('login'))
        ->assertSessionHasErrors(['email' => 'Your account has been deactivated.']);

    $this->assertGuest();
});
