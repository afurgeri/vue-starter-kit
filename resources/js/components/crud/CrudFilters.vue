<script setup lang="ts">
import { Search, SlidersHorizontal, X } from '@lucide/vue';
import { computed } from 'vue';
import CrudCombobox from '@/components/crud/CrudCombobox.vue';
import CrudComboboxMultiple from '@/components/crud/CrudComboboxMultiple.vue';
import CrudSelectMultiple from '@/components/crud/CrudSelectMultiple.vue';
import CrudTemporalInput from '@/components/crud/CrudTemporalInput.vue';
import MobileCrudPicker from '@/components/crud/MobileCrudPicker.vue';
import RemoteCombobox from '@/components/crud/RemoteCombobox.vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useTranslation } from '@/composables/useTranslation';
import type {
    CrudFilter,
    CrudSearch,
    CrudSpan,
    CrudTemporalType,
} from '@/types/crud';

type CrudFilterValue = string | string[];

const props = defineProps<{
    search: CrudSearch;
    filters: CrudFilter[];
    searchValue: string;
    filterValues: Record<string, CrudFilterValue>;
    clearLabel?: string;
    hideSearch?: boolean;
}>();

const emit = defineEmits<{
    search: [value: string];
    filter: [name: string, value: CrudFilterValue, immediate: boolean];
    clear: [];
}>();

const { t } = useTranslation();

const spanClassesByBreakpoint: Record<keyof CrudSpan, string[]> = {
    base: [
        'col-span-1',
        'col-span-2',
        'col-span-3',
        'col-span-4',
        'col-span-5',
        'col-span-6',
        'col-span-7',
        'col-span-8',
        'col-span-9',
        'col-span-10',
        'col-span-11',
        'col-span-12',
    ],
    sm: [
        'sm:col-span-1',
        'sm:col-span-2',
        'sm:col-span-3',
        'sm:col-span-4',
        'sm:col-span-5',
        'sm:col-span-6',
        'sm:col-span-7',
        'sm:col-span-8',
        'sm:col-span-9',
        'sm:col-span-10',
        'sm:col-span-11',
        'sm:col-span-12',
    ],
    md: [
        'md:col-span-1',
        'md:col-span-2',
        'md:col-span-3',
        'md:col-span-4',
        'md:col-span-5',
        'md:col-span-6',
        'md:col-span-7',
        'md:col-span-8',
        'md:col-span-9',
        'md:col-span-10',
        'md:col-span-11',
        'md:col-span-12',
    ],
    lg: [
        'lg:col-span-1',
        'lg:col-span-2',
        'lg:col-span-3',
        'lg:col-span-4',
        'lg:col-span-5',
        'lg:col-span-6',
        'lg:col-span-7',
        'lg:col-span-8',
        'lg:col-span-9',
        'lg:col-span-10',
        'lg:col-span-11',
        'lg:col-span-12',
    ],
    xl: [
        'xl:col-span-1',
        'xl:col-span-2',
        'xl:col-span-3',
        'xl:col-span-4',
        'xl:col-span-5',
        'xl:col-span-6',
        'xl:col-span-7',
        'xl:col-span-8',
        'xl:col-span-9',
        'xl:col-span-10',
        'xl:col-span-11',
        'xl:col-span-12',
    ],
    '2xl': [
        '2xl:col-span-1',
        '2xl:col-span-2',
        '2xl:col-span-3',
        '2xl:col-span-4',
        '2xl:col-span-5',
        '2xl:col-span-6',
        '2xl:col-span-7',
        '2xl:col-span-8',
        '2xl:col-span-9',
        '2xl:col-span-10',
        '2xl:col-span-11',
        '2xl:col-span-12',
    ],
};

function spanClasses(span: CrudSpan): string[] {
    return (Object.entries(span) as [keyof CrudSpan, number][]).flatMap(
        ([breakpoint, columns]) =>
            spanClassesByBreakpoint[breakpoint]?.[columns - 1] ?? [],
    );
}

type FilterEntry =
    | { kind: 'single'; filter: CrudFilter }
    | { kind: 'range'; group: string; from: CrudFilter; to: CrudFilter };

const entries = computed<FilterEntry[]>(() => {
    const result: FilterEntry[] = [];
    const seenGroups = new Set<string>();

    for (const filter of props.filters) {
        if (filter.range === null) {
            result.push({ kind: 'single', filter });
            continue;
        }

        if (seenGroups.has(filter.range)) {
            continue;
        }

        seenGroups.add(filter.range);

        const pair = props.filters.filter((f) => f.range === filter.range);
        const from = pair.find(
            (f) => f.operator === '>' || f.operator === '>=',
        );
        const to = pair.find((f) => f.operator === '<' || f.operator === '<=');

        if (from && to) {
            result.push({ kind: 'range', group: filter.range, from, to });
        } else {
            result.push({ kind: 'single', filter });
        }
    }

    return result;
});

const hasActiveFilters = computed(
    () =>
        props.searchValue !== '' ||
        Object.values(props.filterValues).some(hasFilterValue),
);

function inputType(filter: CrudFilter): string {
    return filter.type === 'number' ? 'number' : 'text';
}

const clearButtonClass =
    'absolute top-1/2 right-2 z-10 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none';
const selectClearButtonClass =
    'absolute top-1/2 right-8 z-10 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none';
const nativeIndicatorClearButtonClass =
    'absolute top-1/2 right-10 z-10 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none';

function hasNativeIndicator(type: CrudFilter['type']): boolean {
    return ['number', 'date', 'time', 'datetime'].includes(type);
}

function clearButtonClassForFilter(filter: CrudFilter): string {
    if (hasNativeIndicator(filter.type)) {
        return nativeIndicatorClearButtonClass;
    }

    if (['select', 'combobox', 'remote-select'].includes(filter.type)) {
        return selectClearButtonClass;
    }

    return clearButtonClass;
}

function filterControlClass(filter: CrudFilter): string {
    if (hasNativeIndicator(filter.type)) {
        return 'w-full pr-4';
    }

    if (
        filter.clearable &&
        !['select', 'combobox', 'remote-select'].includes(filter.type)
    ) {
        return 'w-full pr-9';
    }

    return 'w-full';
}

function isTemporalFilter(type: CrudFilter['type']): type is CrudTemporalType {
    return ['date', 'time', 'datetime'].includes(type);
}

function rangeInvalid(entry: { from: CrudFilter; to: CrudFilter }): boolean {
    const from = props.filterValues[entry.from.name];
    const to = props.filterValues[entry.to.name];

    if (typeof from !== 'string' || typeof to !== 'string' || !from || !to) {
        return false;
    }

    if (entry.from.type === 'number' && entry.to.type === 'number') {
        return Number(from) > Number(to);
    }

    return from > to;
}

function hasFilterValue(value: CrudFilterValue): boolean {
    return Array.isArray(value) ? value.length > 0 : value !== '';
}

function filterTextValue(name: string): string {
    const value = props.filterValues[name];

    return typeof value === 'string' ? value : '';
}

function filterArrayValue(name: string): string[] {
    const value = props.filterValues[name];

    return Array.isArray(value) ? value : [];
}

function clearFilter(filter: CrudFilter | string): void {
    emit(
        'filter',
        typeof filter === 'string' ? filter : filter.name,
        typeof filter === 'string' || !filter.multiple ? '' : [],
        true,
    );
}
</script>

<template>
    <div>
        <div
            v-if="(search.enabled && !hideSearch) || filters.length > 0"
            class="flex flex-col gap-4 rounded-xl bg-card p-4"
        >
            <div class="grid grid-cols-12 items-start gap-4">
                <div
                    v-if="search.enabled && !hideSearch"
                    :class="[
                        'flex w-full flex-col gap-2',
                        spanClasses(search.span),
                    ]"
                >
                    <Label
                        for="crud-search"
                        class="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                        ><Search class="size-3.5" /> {{ t('Search') }}</Label
                    >
                    <Input
                        id="crud-search"
                        :model-value="searchValue"
                        type="search"
                        :placeholder="t('Search records...')"
                        class="w-full bg-muted/40"
                        @update:model-value="
                            (value) => emit('search', String(value))
                        "
                    />
                </div>

                <template
                    v-for="entry in entries"
                    :key="
                        entry.kind === 'single'
                            ? entry.filter.name
                            : entry.group
                    "
                >
                    <div
                        v-if="entry.kind === 'single'"
                        :class="[
                            'flex w-full flex-col gap-2',
                            spanClasses(entry.filter.span),
                        ]"
                    >
                        <Label
                            :for="`filter-${entry.filter.name}`"
                            class="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                            ><SlidersHorizontal class="size-3.5" />{{
                                t(entry.filter.label)
                            }}</Label
                        >

                        <div class="relative w-full">
                            <MobileCrudPicker
                                v-if="
                                    [
                                        'select',
                                        'combobox',
                                        'remote-select',
                                    ].includes(entry.filter.type)
                                "
                                :id="`filter-${entry.filter.name}`"
                                :model-value="
                                    entry.filter.multiple
                                        ? filterArrayValue(entry.filter.name)
                                        : filterTextValue(entry.filter.name)
                                "
                                :options="entry.filter.options ?? []"
                                :remote="entry.filter.remote"
                                :placeholder="entry.filter.label"
                                :multiple="entry.filter.multiple"
                                :searchable="entry.filter.type === 'combobox'"
                                @update:model-value="
                                    (value) =>
                                        emit(
                                            'filter',
                                            entry.filter.name,
                                            value,
                                            true,
                                        )
                                "
                            />
                            <RemoteCombobox
                                v-if="entry.filter.type === 'remote-select'"
                                class="max-sm:hidden"
                                :id="`filter-${entry.filter.name}`"
                                :model-value="
                                    filterTextValue(entry.filter.name)
                                "
                                :remote="entry.filter.remote!"
                                :placeholder="entry.filter.label"
                                @update:model-value="
                                    (value) =>
                                        emit(
                                            'filter',
                                            entry.filter.name,
                                            value,
                                            true,
                                        )
                                "
                            />
                            <CrudCombobox
                                v-else-if="
                                    entry.filter.type === 'combobox' &&
                                    !entry.filter.multiple
                                "
                                class="max-sm:hidden"
                                :id="`filter-${entry.filter.name}`"
                                :model-value="
                                    filterTextValue(entry.filter.name) ||
                                    undefined
                                "
                                :options="entry.filter.options ?? []"
                                :placeholder="entry.filter.label"
                                @update:model-value="
                                    (value) =>
                                        emit(
                                            'filter',
                                            entry.filter.name,
                                            value ?? '',
                                            true,
                                        )
                                "
                            />
                            <CrudComboboxMultiple
                                v-else-if="
                                    entry.filter.type === 'combobox' &&
                                    entry.filter.multiple
                                "
                                class="max-sm:hidden"
                                :id="`filter-${entry.filter.name}`"
                                :model-value="
                                    filterArrayValue(entry.filter.name)
                                "
                                :options="entry.filter.options ?? []"
                                :placeholder="entry.filter.label"
                                @update:model-value="
                                    (value) =>
                                        emit(
                                            'filter',
                                            entry.filter.name,
                                            value,
                                            true,
                                        )
                                "
                            />
                            <Select
                                v-else-if="
                                    entry.filter.type === 'select' &&
                                    !entry.filter.multiple
                                "
                                :model-value="
                                    filterTextValue(entry.filter.name) ||
                                    undefined
                                "
                                @update:model-value="
                                    (value) =>
                                        emit(
                                            'filter',
                                            entry.filter.name,
                                            String(value ?? ''),
                                            true,
                                        )
                                "
                            >
                                <SelectTrigger
                                    :id="`filter-${entry.filter.name}`"
                                    class="w-full max-sm:hidden"
                                >
                                    <SelectValue
                                        :placeholder="t(entry.filter.label)"
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem
                                        v-for="option in entry.filter.options ??
                                        []"
                                        :key="option.value"
                                        :value="option.value"
                                    >
                                        {{ t(option.label) }}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <CrudSelectMultiple
                                v-else-if="
                                    entry.filter.type === 'select' &&
                                    entry.filter.multiple
                                "
                                :id="`filter-${entry.filter.name}`"
                                :model-value="
                                    filterArrayValue(entry.filter.name)
                                "
                                :options="entry.filter.options ?? []"
                                :placeholder="entry.filter.label"
                                @update:model-value="
                                    (value) =>
                                        emit(
                                            'filter',
                                            entry.filter.name,
                                            value,
                                            true,
                                        )
                                "
                            />

                            <CrudTemporalInput
                                v-else-if="isTemporalFilter(entry.filter.type)"
                                :id="`filter-${entry.filter.name}`"
                                :type="entry.filter.type"
                                :model-value="
                                    filterTextValue(entry.filter.name)
                                "
                                :max-value="entry.filter.max_date ?? undefined"
                                :class="filterControlClass(entry.filter)"
                                @update:model-value="
                                    (value) =>
                                        emit(
                                            'filter',
                                            entry.filter.name,
                                            value,
                                            false,
                                        )
                                "
                            />

                            <Input
                                v-else
                                :id="`filter-${entry.filter.name}`"
                                :model-value="
                                    filterTextValue(entry.filter.name)
                                "
                                :type="inputType(entry.filter)"
                                :step="entry.filter.step"
                                :class="filterControlClass(entry.filter)"
                                @update:model-value="
                                    (value) =>
                                        emit(
                                            'filter',
                                            entry.filter.name,
                                            String(value),
                                            false,
                                        )
                                "
                            />

                            <Button
                                v-if="
                                    entry.filter.clearable &&
                                    hasFilterValue(
                                        filterValues[entry.filter.name],
                                    )
                                "
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                :class="clearButtonClassForFilter(entry.filter)"
                                :aria-label="
                                    t('Clear :label', {
                                        label: entry.filter.label,
                                    })
                                "
                                @click="clearFilter(entry.filter)"
                            >
                                <X class="size-4" />
                            </Button>
                        </div>
                    </div>

                    <div v-else :class="['contents']">
                        <div
                            :class="[
                                'flex w-full min-w-0 flex-col gap-2 self-start',
                                spanClasses(entry.from.span),
                            ]"
                        >
                            <Label :for="`filter-${entry.from.name}`">{{
                                t(entry.from.label)
                            }}</Label>
                            <div class="relative w-full">
                                <CrudTemporalInput
                                    v-if="isTemporalFilter(entry.from.type)"
                                    :id="`filter-${entry.from.name}`"
                                    :type="entry.from.type"
                                    :model-value="
                                        filterTextValue(entry.from.name)
                                    "
                                    :max-value="
                                        entry.from.max_date ?? undefined
                                    "
                                    :invalid="rangeInvalid(entry)"
                                    class="w-full"
                                    @update:model-value="
                                        (value) =>
                                            emit(
                                                'filter',
                                                entry.from.name,
                                                value,
                                                false,
                                            )
                                    "
                                />
                                <Input
                                    v-else
                                    :id="`filter-${entry.from.name}`"
                                    :type="inputType(entry.from)"
                                    :model-value="
                                        filterTextValue(entry.from.name)
                                    "
                                    :step="entry.from.step"
                                    :aria-invalid="rangeInvalid(entry)"
                                    class="w-full"
                                    @update:model-value="
                                        (value) =>
                                            emit(
                                                'filter',
                                                entry.from.name,
                                                String(value),
                                                false,
                                            )
                                    "
                                />
                                <Button
                                    v-if="
                                        entry.from.clearable &&
                                        filterValues[entry.from.name]
                                    "
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    :class="
                                        clearButtonClassForFilter(entry.from)
                                    "
                                    :aria-label="
                                        t('Clear :label', {
                                            label: entry.from.label,
                                        })
                                    "
                                    @click="clearFilter(entry.from.name)"
                                >
                                    <X class="size-4" />
                                </Button>
                            </div>
                            <p
                                v-if="rangeInvalid(entry)"
                                class="text-sm text-destructive"
                            >
                                {{
                                    t(
                                        'The start of the range cannot be after the end.',
                                    )
                                }}
                            </p>
                        </div>

                        <div
                            :class="[
                                'flex w-full min-w-0 flex-col gap-2 self-start',
                                spanClasses(entry.to.span),
                            ]"
                        >
                            <Label :for="`filter-${entry.to.name}`">{{
                                t(entry.to.label)
                            }}</Label>
                            <div class="relative w-full">
                                <CrudTemporalInput
                                    v-if="isTemporalFilter(entry.to.type)"
                                    :id="`filter-${entry.to.name}`"
                                    :type="entry.to.type"
                                    :model-value="
                                        filterTextValue(entry.to.name)
                                    "
                                    :max-value="entry.to.max_date ?? undefined"
                                    :invalid="rangeInvalid(entry)"
                                    class="w-full"
                                    @update:model-value="
                                        (value) =>
                                            emit(
                                                'filter',
                                                entry.to.name,
                                                value,
                                                false,
                                            )
                                    "
                                />
                                <Input
                                    v-else
                                    :id="`filter-${entry.to.name}`"
                                    :type="inputType(entry.to)"
                                    :model-value="
                                        filterTextValue(entry.to.name)
                                    "
                                    :step="entry.to.step"
                                    :aria-invalid="rangeInvalid(entry)"
                                    class="w-full"
                                    @update:model-value="
                                        (value) =>
                                            emit(
                                                'filter',
                                                entry.to.name,
                                                String(value),
                                                false,
                                            )
                                    "
                                />
                                <Button
                                    v-if="
                                        entry.to.clearable &&
                                        filterValues[entry.to.name]
                                    "
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    :class="clearButtonClassForFilter(entry.to)"
                                    :aria-label="
                                        t('Clear :label', {
                                            label: entry.to.label,
                                        })
                                    "
                                    @click="clearFilter(entry.to.name)"
                                >
                                    <X class="size-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </template>

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    :disabled="!hasActiveFilters"
                    :aria-hidden="!hasActiveFilters"
                    :class="[
                        'col-span-full w-auto shrink-0 justify-self-end',
                        !hasActiveFilters && 'invisible',
                    ]"
                    @click="emit('clear')"
                >
                    {{ clearLabel ?? t('Clear filters') }}
                </Button>
            </div>
        </div>
    </div>
</template>
