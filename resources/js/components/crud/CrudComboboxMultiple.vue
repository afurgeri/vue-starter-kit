<script setup lang="ts">
import { Check, ChevronDown } from '@lucide/vue';
import { ComboboxContent, ComboboxPortal } from 'reka-ui';
import { computed, ref, watch } from 'vue';
import {
    Combobox,
    ComboboxAnchor,
    ComboboxEmpty,
    ComboboxGroup,
    ComboboxInput,
    ComboboxItem,
    ComboboxItemIndicator,
    ComboboxTrigger,
    ComboboxViewport,
} from '@/components/ui/combobox';
import { useTranslation } from '@/composables/useTranslation';
import { cn } from '@/lib/utils';
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

const open = ref(false);
const searchTerm = ref('');
const selectedValues = computed({
    get: () => props.modelValue,
    set: (value: string[]) => emit('update:modelValue', value),
});
const { t } = useTranslation();

const selectedLabels = computed(() =>
    props.options
        .filter((option) => selectedValues.value.includes(option.value))
        .map((option) => option.label),
);

const filteredOptions = computed(() => {
    const query = searchTerm.value.trim().toLocaleLowerCase();

    if (query === '') {
        return props.options;
    }

    return props.options.filter((option) =>
        option.label.toLocaleLowerCase().includes(query),
    );
});

watch(open, (value) => {
    if (value) {
        searchTerm.value = '';
    }
});

function displayValue(): string {
    return '';
}
</script>

<template>
    <Combobox
        v-model="selectedValues"
        v-model:open="open"
        multiple
        :ignore-filter="true"
        class="w-full"
    >
        <ComboboxAnchor as-child>
            <ComboboxTrigger as-child>
                <button
                    type="button"
                    tabindex="0"
                    :id="id"
                    role="combobox"
                    :aria-expanded="open"
                    :aria-invalid="invalid ? 'true' : undefined"
                    :disabled="disabled"
                    class="flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-left text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:ring-destructive/40"
                >
                    <span
                        class="truncate"
                        :class="
                            selectedLabels.length === 0 &&
                            'text-muted-foreground'
                        "
                    >
                        {{
                            selectedLabels.join(', ') ||
                            placeholder ||
                            t('Select an option...')
                        }}
                    </span>
                    <ChevronDown class="size-4 shrink-0 opacity-50" />
                </button>
            </ComboboxTrigger>
        </ComboboxAnchor>
        <ComboboxPortal>
            <ComboboxContent
                position="popper"
                align="center"
                :side-offset="4"
                class="z-50 max-h-(--reka-combobox-content-available-height) w-[var(--reka-combobox-trigger-width)] max-w-[calc(100vw-2rem)] min-w-64 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md"
            >
                <ComboboxInput
                    v-model="searchTerm"
                    :display-value="displayValue"
                    :placeholder="placeholder"
                />
                <ComboboxViewport>
                    <ComboboxEmpty
                        v-if="filteredOptions.length === 0"
                        class="py-6 text-center text-sm text-muted-foreground"
                    >
                        {{ t('No results found.') }}
                    </ComboboxEmpty>
                    <ComboboxGroup v-else>
                        <ComboboxItem
                            v-for="option in filteredOptions"
                            :key="option.value"
                            :value="option.value"
                        >
                            <ComboboxItemIndicator
                                class="mr-2 flex size-4 items-center justify-center"
                            >
                                <Check
                                    :class="
                                        cn(
                                            'size-4',
                                            selectedValues.includes(
                                                option.value,
                                            )
                                                ? 'opacity-100'
                                                : 'opacity-0',
                                        )
                                    "
                                />
                            </ComboboxItemIndicator>
                            <span class="truncate">{{ option.label }}</span>
                        </ComboboxItem>
                    </ComboboxGroup>
                </ComboboxViewport>
            </ComboboxContent>
        </ComboboxPortal>
    </Combobox>
</template>
