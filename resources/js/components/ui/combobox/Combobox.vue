<script setup lang="ts">
import type { ComboboxRootEmits, ComboboxRootProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { ComboboxRoot, useForwardPropsEmits } from 'reka-ui';
import { cn } from '@/lib/utils';

const props = defineProps<
    ComboboxRootProps & { class?: HTMLAttributes['class'] }
>();
const emits = defineEmits<ComboboxRootEmits>();
const delegatedProps = reactiveOmit(props, 'class');
const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
    <ComboboxRoot
        data-slot="combobox"
        v-bind="forwarded"
        :class="cn(props.class)"
    >
        <slot />
    </ComboboxRoot>
</template>
