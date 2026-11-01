<script setup lang="ts">
import type { ComboboxGroupProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { ComboboxGroup } from 'reka-ui';
import { cn } from '@/lib/utils';

const props = defineProps<
    ComboboxGroupProps & { class?: HTMLAttributes['class'] }
>();
</script>

<template>
    <ComboboxGroup
        data-slot="combobox-group"
        v-bind="props"
        :class="cn('overflow-hidden p-1 text-foreground', props.class)"
    >
        <slot />
    </ComboboxGroup>
</template>
