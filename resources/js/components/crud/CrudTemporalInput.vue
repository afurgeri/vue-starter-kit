<script setup lang="ts">
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import type { CrudTemporalType } from '@/types/crud';

const props = withDefaults(
    defineProps<{
        id: string;
        type: CrudTemporalType;
        modelValue?: string;
        maxValue?: string;
        invalid?: boolean;
        class?: string;
    }>(),
    {
        modelValue: '',
        maxValue: undefined,
        invalid: false,
        class: undefined,
    },
);

const emit = defineEmits<{
    'update:modelValue': [value: string];
}>();

function inputType(): 'time' | 'datetime-local' {
    return props.type === 'time' ? 'time' : 'datetime-local';
}
</script>

<template>
    <div class="w-full">
        <DatePicker
            v-if="type === 'date'"
            :id="id"
            :model-value="modelValue"
            :max-value="maxValue"
            :aria-invalid="invalid ? 'true' : undefined"
            :class="props.class"
            @update:model-value="emit('update:modelValue', $event)"
        />
        <Input
            v-else
            :id="id"
            :type="inputType()"
            :model-value="modelValue"
            :aria-invalid="invalid ? 'true' : undefined"
            :class="props.class"
            @update:model-value="emit('update:modelValue', String($event))"
        />
    </div>
</template>
