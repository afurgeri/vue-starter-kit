<?php

use App\Http\Middleware\HandleInertiaRequests;
use App\Models\User;
use Inertia\Testing\AssertableInertia;
use Modules\Rbac\Models\Permission;
use Modules\Rbac\Models\Role;
use Modules\Rbac\RbacPermissions;

test('pages share the permissions granted through the user roles', function () {
    $role = Role::query()->create(['name' => 'user-manager']);
    $permission = Permission::query()->create(['name' => RbacPermissions::VIEW_USERS]);
    Permission::query()->create(['name' => RbacPermissions::VIEW_ROLES]);
    $role->permissions()->sync([$permission->getKey()]);

    $user = User::factory()->create();
    $user->roles()->sync([$role->getKey()]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('auth.permissions', [RbacPermissions::VIEW_USERS]));
});

test('a different user does not reuse the permissions remembered for the previous one', function () {
    $previousUser = User::factory()->create();
    $role = Role::query()->create(['name' => 'user-manager']);
    $role->permissions()->sync([Permission::query()->create(['name' => RbacPermissions::VIEW_USERS])->getKey()]);
    $user = User::factory()->create();
    $user->roles()->sync([$role->getKey()]);

    $this->actingAs($user)
        ->get(route('dashboard'), [
            'X-Inertia' => 'true',
            'X-Inertia-Version' => app(HandleInertiaRequests::class)->version(request()),
            'X-Inertia-Except-Once-Props' => 'permissions.'.$previousUser->getKey(),
        ])
        ->assertOk()
        ->assertJsonPath('props.auth.permissions', [RbacPermissions::VIEW_USERS]);
});
