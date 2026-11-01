<?php

use App\Http\Middleware\HandleInertiaRequests;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

test('the first visit receives the translations for the app locale', function () {
    app()->setLocale('es');

    $this->actingAs(User::factory()->create())
        ->get(route('dashboard'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('translations.Users', 'Usuarios')
            ->etc());
});

test('later visits do not send the translations again', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('dashboard'), [
            'X-Inertia' => 'true',
            'X-Inertia-Version' => app(HandleInertiaRequests::class)->version(request()),
            'X-Inertia-Except-Once-Props' => 'translations.en',
        ])
        ->assertOk()
        ->assertJsonPath('props.name', config('app.name'))
        ->assertJsonMissingPath('props.translations');
});
