<script setup lang="ts">
import { crudBadgeClasses } from '@/composables/useCrudFormat';
import type { CrudBadgeVariant } from '@/types/crud';

withDefaults(defineProps<{ variant?: CrudBadgeVariant }>(), {
    variant: 'neutral',
});
</script>

<template>
    <span
        :class="[
            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap',
            crudBadgeClasses[variant],
        ]"
    >
        <slot />
    </span>
</template>
