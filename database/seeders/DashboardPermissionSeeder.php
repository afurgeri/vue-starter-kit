<?php

namespace Database\Seeders;

use App\Dashboard\DashboardPermissions;
use Illuminate\Database\Seeder;
use Modules\Rbac\RbacModels;

class DashboardPermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissionModel = RbacModels::permission();

        foreach (DashboardPermissions::all() as $permission) {
            $attributes = ['name' => $permission];

            if (config('rbac.storage', 'mysql') === 'mongodb') {
                $attributes['role_ids'] = [];
            }

            $permissionModel::updateOrCreate(['name' => $permission], $attributes);
        }
    }
}
