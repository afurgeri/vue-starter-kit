<script setup lang="ts">
import { ChevronDown } from '@lucide/vue';
import { computed } from 'vue';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { CrudFilterOption } from '@/types/crud';

const props = withDefaults(
    defineProps<{
        modelValue?: string[];
        options: CrudFilterOption[];
        id?: string;
        placeholder?: string;
        disabled?: boolean;
        invalid?: boolean;
    }>(),
    {
        modelValue: () => [],
        id: undefined,
        placeholder: undefined,
        disabled: false,
        invalid: false,
    },
);

const emit = defineEmits<{
    'update:modelValue': [value: string[]];
}>();

const selectedLabels = computed(() =>
    props.options
        .filter((option) => props.modelValue.includes(option.value))
        .map((option) => option.label),
);

function updateOption(value: string, checked: boolean): void {
    emit(
        'update:modelValue',
        checked
            ? [...props.modelValue, value]
            : props.modelValue.filter((selected) => selected !== value),
    );
}
</script>

<template>
    <DropdownMenu>
        <DropdownMenuTrigger as-child>
            <button
                type="button"
                :id="id"
                :disabled="disabled"
                :aria-invalid="invalid ? 'true' : undefined"
                class="flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-left text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 max-sm:hidden dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:ring-destructive/40"
            >
                <span
                    class="truncate"
                    :class="
                        selectedLabels.length === 0 && 'text-muted-foreground'
                    "
                >
                    {{ selectedLabels.join(', ') || placeholder }}
                </span>
                <ChevronDown class="size-4 shrink-0 opacity-50" />
            </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
            class="w-[var(--reka-dropdown-menu-trigger-width)]"
        >
            <DropdownMenuCheckboxItem
                v-for="option in options"
                :key="option.value"
                :checked="modelValue.includes(option.value)"
                @select.prevent
                @update:checked="
                    (checked: boolean | 'indeterminate') =>
                        updateOption(option.value, Boolean(checked))
                "
            >
                {{ option.label }}
            </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
    </DropdownMenu>
</template>
