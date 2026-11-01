<script setup lang="ts">
import type { ComboboxViewportProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { ComboboxViewport } from 'reka-ui';
import { cn } from '@/lib/utils';

const props = defineProps<
    ComboboxViewportProps & { class?: HTMLAttributes['class'] }
>();
</script>

<template>
    <ComboboxViewport
        data-slot="combobox-viewport"
        v-bind="props"
        :class="cn('max-h-60 overflow-y-auto p-1', props.class)"
    >
        <slot />
    </ComboboxViewport>
</template>
