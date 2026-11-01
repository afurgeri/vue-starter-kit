<script setup lang="ts">
import { Check, ChevronDown, LoaderCircle } from '@lucide/vue';
import { ComboboxContent, ComboboxPortal } from 'reka-ui';
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
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
import type { CrudOption, CrudRemoteFilter } from '@/types/crud';

const props = withDefaults(
    defineProps<{
        modelValue: string;
        remote: CrudRemoteFilter;
        dependencies?: Readonly<Record<string, unknown>>;
        id?: string;
        placeholder?: string;
        disabled?: boolean;
    }>(),
    { placeholder: undefined, disabled: false },
);

const emit = defineEmits<{
    'update:modelValue': [value: string];
}>();

const open = ref(false);
const searchTerm = ref('');
const selectedValue = ref<string | undefined>(props.modelValue || undefined);
const selectedOption = ref<CrudOption>();
const options = ref<CrudOption[]>([]);
const loading = ref(false);
const { t } = useTranslation();

let debounceTimer: ReturnType<typeof setTimeout> | undefined;
let requestController: AbortController | undefined;
let requestSequence = 0;

function normalizeOptions(payload: unknown): CrudOption[] {
    const source = Array.isArray(payload)
        ? payload
        : payload && typeof payload === 'object'
          ? ((payload as { data?: unknown; options?: unknown }).data ??
            (payload as { options?: unknown }).options ??
            [])
          : [];

    if (!Array.isArray(source)) {
        return [];
    }

    return source.flatMap((option): CrudOption[] => {
        if (
            !option ||
            typeof option !== 'object' ||
            !('value' in option) ||
            !('label' in option) ||
            (typeof option.value !== 'string' &&
                typeof option.value !== 'number') ||
            typeof option.label !== 'string'
        ) {
            return [];
        }

        return [
            {
                ...(option as Record<string, unknown>),
                value: String(option.value),
                label: option.label,
            },
        ];
    });
}

async function loadOptions(search: string, selected?: string): Promise<void> {
    if (props.disabled && selected === undefined) {
        options.value = [];

        return;
    }

    if (selected === undefined && search.length < props.remote.min_chars) {
        options.value = [];

        return;
    }

    requestController?.abort();
    requestController = new AbortController();
    const sequence = ++requestSequence;
    const url = new URL(props.remote.url, window.location.origin);
    url.searchParams.set('source', props.remote.source ?? 'filter');

    for (const [name, value] of Object.entries(props.dependencies ?? {})) {
        if (value !== null && value !== undefined && value !== '') {
            url.searchParams.set(name, String(value));
        }
    }

    if (search !== '') {
        url.searchParams.set('search', search);
    }

    if (selected !== undefined) {
        url.searchParams.set('selected', selected);
    }

    loading.value = true;

    try {
        const response = await fetch(url, {
            headers: { Accept: 'application/json' },
            signal: requestController.signal,
        });

        if (!response.ok) {
            return;
        }

        const nextOptions = normalizeOptions(await response.json());

        if (sequence !== requestSequence) {
            return;
        }

        options.value = nextOptions;

        if (selected !== undefined) {
            selectedOption.value = nextOptions.find(
                (option) => option.value === selected,
            );
        }
    } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
            options.value = [];
        }
    } finally {
        if (sequence === requestSequence) {
            loading.value = false;
        }
    }
}

function displayValue(value: unknown): string {
    if (value === selectedValue.value) {
        return selectedOption.value?.label ?? '';
    }

    return typeof value === 'string' ? value : '';
}

function scheduleSearch(value: string): void {
    clearTimeout(debounceTimer);

    if (value.length < props.remote.min_chars) {
        requestController?.abort();
        options.value = [];
        loading.value = false;

        return;
    }

    debounceTimer = setTimeout(() => loadOptions(value), props.remote.debounce);
}

function selectOption(option: CrudOption): void {
    selectedValue.value = option.value;
    selectedOption.value = option;
    open.value = false;
    emit('update:modelValue', option.value);
}

watch(
    () => props.modelValue,
    (value) => {
        selectedValue.value = value || undefined;

        if (value === '') {
            selectedOption.value = undefined;
            searchTerm.value = '';
            options.value = [];
        } else if (selectedOption.value?.value !== value) {
            void loadOptions('', value);
        }
    },
);

watch(searchTerm, scheduleSearch);

watch(
    () => props.dependencies,
    () => {
        requestController?.abort();
        options.value = [];
        selectedOption.value = undefined;

        if (props.modelValue !== '') {
            void loadOptions('', props.modelValue);
        }
    },
    { deep: true },
);

watch(open, async (value) => {
    if (!value) {
        return;
    }

    searchTerm.value = '';
    options.value = [];

    await nextTick();

    if (props.modelValue !== '') {
        void loadOptions('', props.modelValue);
    }
});

onMounted(() => {
    if (props.modelValue !== '') {
        void loadOptions('', props.modelValue);
    }
});

onBeforeUnmount(() => {
    clearTimeout(debounceTimer);
    requestController?.abort();
});
</script>

<template>
    <Combobox v-model="selectedValue" v-model:open="open" class="w-full">
        <ComboboxAnchor as-child>
            <ComboboxTrigger as-child>
                <button
                    type="button"
                    tabindex="0"
                    :id="id"
                    role="combobox"
                    :aria-expanded="open"
                    :disabled="disabled"
                    :data-placeholder="selectedOption ? undefined : ''"
                    class="flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-left text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[placeholder]:text-muted-foreground dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:ring-destructive/40 [&_svg:not([class*='text-'])]:text-muted-foreground"
                >
                    <span class="truncate">
                        {{ selectedOption?.label ?? placeholder }}
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
                    :placeholder="placeholder ?? t('Search...')"
                />
                <ComboboxViewport>
                    <div
                        v-if="loading"
                        class="flex items-center justify-center gap-2 px-2 py-6 text-sm text-muted-foreground"
                    >
                        <LoaderCircle class="size-4 animate-spin" />
                        {{ t('Loading...') }}
                    </div>
                    <ComboboxEmpty
                        v-else-if="
                            searchTerm.length < remote.min_chars &&
                            options.length === 0
                        "
                        class="py-6 text-center text-sm text-muted-foreground"
                    >
                        {{
                            t('Type :count characters to search.', {
                                count: remote.min_chars,
                            })
                        }}
                    </ComboboxEmpty>
                    <ComboboxEmpty
                        v-else-if="options.length === 0"
                        class="py-6 text-center text-sm text-muted-foreground"
                    >
                        {{ t('No results found.') }}
                    </ComboboxEmpty>
                    <ComboboxGroup v-else>
                        <ComboboxItem
                            v-for="option in options"
                            :key="option.value"
                            :value="option.value"
                            @select="selectOption(option)"
                        >
                            <ComboboxItemIndicator
                                class="mr-2 flex size-4 items-center justify-center"
                            >
                                <Check
                                    :class="
                                        cn(
                                            'size-4',
                                            selectedValue === option.value
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
