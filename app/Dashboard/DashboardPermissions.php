<?php

namespace App\Dashboard;

/**
 * The dashboard shows how much money the business moves, so it is granted on its own.
 */
final class DashboardPermissions
{
    public const VIEW = 'dashboard.view';

    /**
     * @return list<string>
     */
    public static function all(): array
    {
        return [self::VIEW];
    }
}
