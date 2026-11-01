<script setup lang="ts">
import type { ComboboxItemIndicatorProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { ComboboxItemIndicator } from 'reka-ui';
import { cn } from '@/lib/utils';

const props = defineProps<
    ComboboxItemIndicatorProps & { class?: HTMLAttributes['class'] }
>();
</script>

<template>
    <ComboboxItemIndicator
        data-slot="combobox-item-indicator"
        v-bind="props"
        :class="cn('mr-2 flex size-4 items-center justify-center', props.class)"
    >
        <slot />
    </ComboboxItemIndicator>
</template>
