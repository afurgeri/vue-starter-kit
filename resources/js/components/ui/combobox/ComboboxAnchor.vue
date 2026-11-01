<script setup lang="ts">
import type { ComboboxAnchorProps } from 'reka-ui';
import { ComboboxAnchor } from 'reka-ui';

const props = defineProps<ComboboxAnchorProps>();
</script>

<template>
    <ComboboxAnchor v-bind="props">
        <slot />
    </ComboboxAnchor>
</template>
