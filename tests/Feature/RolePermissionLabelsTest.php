<?php

use App\Models\User;
use Modules\Rbac\Models\Permission;
use Modules\Rbac\Models\Role;

it('lists permissions with readable labels, grouped and in the usual action order', function () {
    app()->setLocale('es');
    $role = Role::query()->create(['name' => 'admin-'.uniqid()]);
    $role->permissions()->sync(collect(['roles.view', 'users.delete', 'users.view', 'users.export', 'legacy.thing'])
        ->map(fn (string $name): int => Permission::query()->firstOrCreate(['name' => $name])->id));
    $user = User::factory()->create();
    $user->roles()->attach($role);

    $permissions = $this->actingAs($user)->get(route('roles.index'))
        ->viewData('page')['props']['permissions'];

    expect(collect($permissions)->pluck('label')->all())->toBe([
        'legacy.thing',
        'Roles: ver',
        'Usuarios: ver',
        'Usuarios: eliminar',
        'Usuarios: exportar',
    ])
        ->and($permissions[3])->toMatchArray(['subject' => 'Usuarios', 'column' => 'delete'])
        ->and($permissions[4])->toMatchArray(['subject' => 'Usuarios', 'column' => null, 'action' => 'Exportar']);
});
