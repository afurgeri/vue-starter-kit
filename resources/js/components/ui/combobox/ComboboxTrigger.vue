<script setup lang="ts">
import type { ComboboxTriggerProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { ComboboxTrigger } from 'reka-ui';
import { cn } from '@/lib/utils';

const props = defineProps<
    ComboboxTriggerProps & { class?: HTMLAttributes['class'] }
>();
</script>

<template>
    <ComboboxTrigger
        data-slot="combobox-trigger"
        v-bind="props"
        :class="cn(props.class)"
    >
        <slot />
    </ComboboxTrigger>
</template>
