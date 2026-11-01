<?php

return [
    'default_page_size' => 10,
    'locale' => env('CRUD_LOCALE', 'es-AR'),
    'default_filters_open' => false,
    'pagination' => [
        'driver' => env('CRUD_PAGINATION_DRIVER', 'simple'),
    ],
    'default_form_mode' => 'page',
    'default_page_width' => 'full',
    'default_form_width' => 'full',
];
