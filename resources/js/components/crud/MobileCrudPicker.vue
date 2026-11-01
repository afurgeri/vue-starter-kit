<script setup lang="ts">
import { Check, ChevronDown, LoaderCircle, X } from '@lucide/vue';
import {
    DialogContent,
    DialogDescription,
    DialogOverlay,
    DialogPortal,
    DialogRoot,
    DialogTitle,
} from 'reka-ui';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useTranslation } from '@/composables/useTranslation';
import type { CrudFilterOption, CrudRemoteFilter } from '@/types/crud';

const props = withDefaults(
    defineProps<{
        modelValue?: string | string[];
        options?: CrudFilterOption[];
        remote?: CrudRemoteFilter;
        dependencies?: Readonly<Record<string, unknown>>;
        id?: string;
        placeholder?: string;
        disabled?: boolean;
        invalid?: boolean;
        multiple?: boolean;
        searchable?: boolean;
    }>(),
    {
        options: () => [],
        multiple: false,
        searchable: false,
        disabled: false,
        invalid: false,
    },
);

const emit = defineEmits<{
    'update:modelValue': [value: string | string[]];
}>();

const { t } = useTranslation();
const open = ref(false);
const search = ref('');
const remoteOptions = ref<CrudFilterOption[]>([]);
const selectedRemoteOption = ref<CrudFilterOption>();
const loading = ref(false);
let debounceTimer: ReturnType<typeof setTimeout> | undefined;
let controller: AbortController | undefined;

const selected = computed(() =>
    Array.isArray(props.modelValue)
        ? props.modelValue
        : props.modelValue
          ? [props.modelValue]
          : [],
);

const availableOptions = computed(() => {
    if (props.remote) {
        return remoteOptions.value;
    }

    const query = search.value.trim().toLocaleLowerCase();

    return query && props.searchable
        ? props.options.filter((option) =>
              option.label.toLocaleLowerCase().includes(query),
          )
        : props.options;
});

const label = computed(() => {
    const options = props.remote
        ? [
              ...remoteOptions.value,
              ...(selectedRemoteOption.value
                  ? [selectedRemoteOption.value]
                  : []),
          ]
        : props.options;

    return (
        selected.value
            .map(
                (value) =>
                    options.find((option) => option.value === value)?.label,
            )
            .filter(Boolean)
            .join(', ') ||
        props.placeholder ||
        t('Select an option...')
    );
});

async function loadOptions(selectedValue?: string): Promise<void> {
    if (!props.remote || (props.disabled && !selectedValue)) {
        return;
    }

    controller?.abort();
    controller = new AbortController();
    const signal = controller.signal;
    const url = new URL(props.remote.url, window.location.origin);
    url.searchParams.set('source', props.remote.source ?? 'filter');

    for (const [name, value] of Object.entries(props.dependencies ?? {})) {
        if (value !== null && value !== undefined && value !== '') {
            url.searchParams.set(name, String(value));
        }
    }

    if (selectedValue) {
        url.searchParams.set('selected', selectedValue);
    }

    if (search.value) {
        url.searchParams.set('search', search.value);
    }

    loading.value = true;

    try {
        const response = await fetch(url, {
            headers: { Accept: 'application/json' },
            signal,
        });

        if (!response.ok) {
            return;
        }

        const payload: unknown = await response.json();
        const data = Array.isArray(payload)
            ? payload
            : payload && typeof payload === 'object'
              ? ((payload as { data?: unknown; options?: unknown }).data ??
                (payload as { options?: unknown }).options)
              : [];

        if (signal.aborted) {
            return;
        }

        const options: CrudFilterOption[] = Array.isArray(data)
            ? data.flatMap((item): CrudFilterOption[] =>
                  item &&
                  typeof item === 'object' &&
                  (typeof item.value === 'string' ||
                      typeof item.value === 'number') &&
                  typeof item.label === 'string'
                      ? [{ value: String(item.value), label: item.label }]
                      : [],
              )
            : [];
        remoteOptions.value = options;

        if (selectedValue) {
            selectedRemoteOption.value = options.find(
                (option) => option.value === selectedValue,
            );
        }
    } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
            remoteOptions.value = [];
        }
    } finally {
        if (!signal.aborted) {
            loading.value = false;
        }
    }
}

watch(open, (isOpen) => {
    clearTimeout(debounceTimer);
    controller?.abort();

    if (isOpen) {
        search.value = '';

        if (props.remote && selected.value[0]) {
            void loadOptions(selected.value[0]);
        }
    }
});

watch(search, (value) => {
    if (!open.value || !props.remote) {
        return;
    }

    clearTimeout(debounceTimer);
    controller?.abort();
    remoteOptions.value = [];
    loading.value = false;

    if (value.length >= props.remote.min_chars) {
        debounceTimer = setTimeout(
            () => void loadOptions(),
            props.remote!.debounce,
        );
    }
});

watch(
    () => [props.modelValue, props.dependencies] as const,
    () => {
        controller?.abort();
        selectedRemoteOption.value = undefined;

        if (props.remote && selected.value[0]) {
            void loadOptions(selected.value[0]);
        }
    },
    { deep: true },
);

onMounted(() => {
    if (props.remote && selected.value[0]) {
        void loadOptions(selected.value[0]);
    }
});

onBeforeUnmount(() => {
    clearTimeout(debounceTimer);
    controller?.abort();
});

function choose(option: CrudFilterOption): void {
    if (props.multiple) {
        emit(
            'update:modelValue',
            selected.value.includes(option.value)
                ? selected.value.filter((value) => value !== option.value)
                : [...selected.value, option.value],
        );
    } else {
        selectedRemoteOption.value = option;
        emit('update:modelValue', option.value);
        open.value = false;
    }
}
</script>

<template>
    <div class="sm:hidden">
        <button
            :id="id"
            type="button"
            :disabled="disabled"
            :aria-invalid="invalid ? 'true' : undefined"
            :aria-expanded="open"
            class="flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 text-left text-sm shadow-xs disabled:opacity-50 aria-invalid:border-destructive"
            @click="open = true"
        >
            <span
                class="truncate"
                :class="!selected.length && 'text-muted-foreground'"
                >{{ label }}</span
            >
            <ChevronDown class="size-4 shrink-0 opacity-50" />
        </button>
        <DialogRoot v-model:open="open">
            <DialogPortal>
                <DialogOverlay class="fixed inset-0 z-[100] bg-black/50" />
                <DialogContent
                    class="fixed inset-0 z-[101] flex h-dvh w-screen flex-col overflow-hidden bg-background text-foreground outline-none"
                >
                    <header
                        class="flex shrink-0 items-center justify-between gap-4 border-b px-4 py-3"
                    >
                        <DialogTitle class="truncate font-semibold">{{
                            placeholder ?? t('Select an option...')
                        }}</DialogTitle>
                        <DialogDescription class="sr-only">{{
                            t('Select an option...')
                        }}</DialogDescription>
                        <button
                            type="button"
                            :aria-label="t('Close')"
                            class="rounded-md p-2"
                            @click="open = false"
                        >
                            <X class="size-5" />
                        </button>
                    </header>
                    <div
                        v-if="searchable || remote"
                        class="shrink-0 border-b p-4"
                    >
                        <input
                            v-model="search"
                            type="search"
                            :placeholder="t('Search...')"
                            class="h-11 w-full rounded-md border border-input bg-background px-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                    </div>
                    <div
                        class="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]"
                    >
                        <div
                            v-if="loading"
                            class="flex items-center justify-center gap-2 p-6 text-sm text-muted-foreground"
                        >
                            <LoaderCircle class="size-4 animate-spin" />{{
                                t('Loading...')
                            }}
                        </div>
                        <p
                            v-else-if="
                                remote &&
                                search.length < remote.min_chars &&
                                !availableOptions.length
                            "
                            class="p-6 text-center text-sm text-muted-foreground"
                        >
                            {{
                                t('Type :count characters to search.', {
                                    count: remote.min_chars,
                                })
                            }}
                        </p>
                        <p
                            v-else-if="!availableOptions.length"
                            class="p-6 text-center text-sm text-muted-foreground"
                        >
                            {{ t('No results found.') }}
                        </p>
                        <button
                            v-for="option in availableOptions"
                            :key="option.value"
                            type="button"
                            class="flex min-h-12 w-full items-center gap-3 border-b px-4 py-3 text-left text-sm"
                            @click="choose(option)"
                        >
                            <Check
                                class="size-4 shrink-0"
                                :class="
                                    selected.includes(option.value)
                                        ? 'opacity-100'
                                        : 'opacity-0'
                                "
                            />
                            {{ option.label }}
                        </button>
                    </div>
                    <button
                        v-if="multiple"
                        type="button"
                        class="shrink-0 border-t p-4 text-center font-medium"
                        @click="open = false"
                    >
                        {{ t('Done') }}
                    </button>
                </DialogContent>
            </DialogPortal>
        </DialogRoot>
    </div>
</template>
