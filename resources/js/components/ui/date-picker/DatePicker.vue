<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { computed } from 'vue';
import { Input } from '@/components/ui/input';

const props = defineProps<{
    id?: string;
    modelValue?: string;
    maxValue?: string;
    class?: HTMLAttributes['class'];
}>();

const emit = defineEmits<{
    'update:modelValue': [value: string];
}>();

const value = computed({
    get: () => props.modelValue ?? '',
    set: (nextValue: string | number) => emit('update:modelValue', String(nextValue)),
});
</script>

<template>
    <Input
        :id="id"
        v-model="value"
        type="date"
        :max="maxValue"
        :class="props.class"
    />
</template>
