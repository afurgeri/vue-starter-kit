<script setup lang="ts" generic="T extends CrudRecord">
import { Link, router } from '@inertiajs/vue3';
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Download,
    Eye,
    Pencil,
    Plus,
    Search,
    SlidersHorizontal,
    X,
} from '@lucide/vue';
import { computed, reactive, ref, useSlots } from 'vue';
import CrudCellValue from '@/components/crud/CrudCellValue.vue';
import CrudDeleteDialog from '@/components/crud/CrudDeleteDialog.vue';
import CrudFilters from '@/components/crud/CrudFilters.vue';
import CrudFormDialog from '@/components/crud/CrudFormDialog.vue';
import CrudTable from '@/components/crud/CrudTable.vue';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTranslation } from '@/composables/useTranslation';
import type {
    CrudCreateConfig,
    CrudDestroyConfig,
    CrudFilterValue,
    CrudEditConfig,
    CrudPaginator,
    CrudRecord,
    CrudSchema,
    CrudShowConfig,
} from '@/types/crud';

const props = withDefaults(
    defineProps<{
        schema: CrudSchema;
        records: CrudPaginator<T>;
        create: CrudCreateConfig;
        show?: CrudShowConfig<T>;
        edit: CrudEditConfig<T>;
        destroy: CrudDestroyConfig<T>;
        lockedLabel?: string;
        workspace?: string;
        embedded?: boolean;
        fullPageForms?: boolean;
        panelKey?: string;
        reloadProp?: string;
        hiddenFilters?: string[];
        hiddenColumns?: string[];
        hiddenFields?: string[];
        fixedFilters?: Record<string, CrudFilterValue>;
        itemsClass?: string;
    }>(),
    {
        lockedLabel: undefined,
        workspace: undefined,
        embedded: false,
        fullPageForms: undefined,
        panelKey: undefined,
        reloadProp: undefined,
        hiddenFilters: () => [],
        hiddenColumns: () => [],
        hiddenFields: () => [],
        fixedFilters: () => ({}),
    },
);

const { t } = useTranslation();
const slots = useSlots();

function hasSlot(name: string): boolean {
    return Boolean(slots[name]);
}

const layoutWidthClasses = {
    standard: 'max-w-7xl',
    wide: 'max-w-screen-2xl',
    full: 'max-w-none',
} as const;

function canEditRecord(record: T): boolean {
    return (
        props.schema.operations.update &&
        (props.edit.can ? props.edit.can(record) : true)
    );
}

function canDestroyRecord(record: T): boolean {
    return (
        props.schema.operations.delete &&
        (props.destroy.can ? props.destroy.can(record) : true)
    );
}

function canShowRecord(record: T): boolean {
    return (
        props.schema.operations.show &&
        (props.show?.can ? props.show.can(record) : true)
    );
}

function usesFullPageForms(): boolean {
    return (
        (props.fullPageForms ?? !props.embedded) &&
        props.schema.form_mode === 'page'
    );
}

function editRecordTitle(record: T): string {
    if (props.edit.title) {
        return props.edit.title(record);
    }

    return t('Edit :id', { id: String(record.id) });
}

function destroyRecordTitle(record: T): string {
    if (props.destroy.title) {
        return props.destroy.title(record);
    }

    return t('Delete this record?');
}

function recordFieldPrefix(record: T): string {
    return `${props.schema.resource}-${String(record.id)}`;
}

const sortState = reactive({
    column: props.schema.sort?.column ?? null,
    direction: props.schema.sort?.direction ?? 'asc',
});

const searchValue = ref(props.schema.search.value ?? '');
const isLoading = ref(false);
const filtersOpen = ref(props.schema.filters_open);

const filterValues = reactive<Record<string, CrudFilterValue>>(
    Object.fromEntries(
        props.schema.filters.map((filter) => [
            filter.name,
            props.fixedFilters[filter.name] ?? filterSchemaValue(filter),
        ]),
    ),
);

const visibleFilters = computed(() =>
    props.schema.filters.filter(
        (filter) =>
            !props.hiddenFilters.includes(filter.name) &&
            !Object.hasOwn(props.fixedFilters, filter.name),
    ),
);

const visibleColumns = computed(() =>
    props.schema.columns.filter(
        (column) => !props.hiddenColumns.includes(column.name),
    ),
);

const sortableColumns = computed(() =>
    visibleColumns.value.filter((column) => column.sortable),
);

const visibleFields = computed(() =>
    props.schema.fields.filter(
        (field) => !props.hiddenFields.includes(field.name),
    ),
);

const visibleUpdateFields = computed(() =>
    visibleFields.value.filter((field) => field.visible_on_update),
);

const visibleFilterValues = computed(() =>
    Object.fromEntries(
        visibleFilters.value.map((filter) => [
            filter.name,
            filterValues[filter.name],
        ]),
    ),
);

const activeFilterCount = computed(
    () =>
        Object.entries(filterValues).filter(
            ([name, value]) =>
                !Object.hasOwn(props.fixedFilters, name) &&
                hasFilterValue(value),
        ).length,
);

const hasActiveQuery = computed(
    () => activeFilterCount.value > 0 || searchValue.value !== '',
);

const exportHref = computed(() => {
    if (!props.schema.operations.export || !props.schema.export_url) {
        return null;
    }

    const query = new URLSearchParams();

    if (sortState.column) {
        query.set('sort', sortState.column);
        query.set('direction', sortState.direction);
    }

    if (searchValue.value) {
        query.set('search', searchValue.value);
    }

    for (const [name, value] of Object.entries(filterValues)) {
        if (Array.isArray(value)) {
            value.forEach((item) => query.append(`filters[${name}][]`, item));
        } else if (value !== '') {
            query.set(`filters[${name}]`, value);
        }
    }

    const queryString = query.toString();

    return queryString
        ? `${props.schema.export_url}?${queryString}`
        : props.schema.export_url;
});

const searchPlaceholder = computed(() => {
    const fields = props.schema.search.fields ?? [];

    if (fields.length === 0) {
        return t('Search records...');
    }

    const shown = fields
        .slice(0, 4)
        .map((field) => t(field).toLocaleLowerCase())
        .join(', ');

    return t('Search by :fields', {
        fields: fields.length > 4 ? `${shown}…` : shown,
    });
});

const defaultPerPage = props.records.per_page;
const perPageOptions = [...new Set([10, 25, 50, 100, defaultPerPage])].sort(
    (a, b) => a - b,
);
const perPage = ref(props.records.per_page);

let navigateTimer: ReturnType<typeof setTimeout> | undefined;

type CrudQuery = {
    page?: number;
    sort?: string;
    direction?: 'asc' | 'desc';
    search?: string;
    filters?: Record<string, CrudFilterValue>;
    per_page?: number;
};

function filterSchemaValue(
    filter: CrudSchema['filters'][number],
): CrudFilterValue {
    if (filter.multiple && Array.isArray(filter.value)) {
        return filter.value.filter(
            (value): value is string => typeof value === 'string',
        );
    }

    return typeof filter.value === 'string' ? filter.value : '';
}

function hasFilterValue(value: CrudFilterValue): boolean {
    return Array.isArray(value) ? value.length > 0 : value !== '';
}

function navigate(page = 1): void {
    clearTimeout(navigateTimer);

    const query: CrudQuery = {};

    if (page > 1) {
        query.page = page;
    }

    if (sortState.column) {
        query.sort = sortState.column;
        query.direction = sortState.direction;
    }

    if (searchValue.value) {
        query.search = searchValue.value;
    }

    if (perPage.value !== defaultPerPage) {
        query.per_page = perPage.value;
    }

    const activeFilters = Object.fromEntries(
        Object.entries(filterValues).filter(([, value]) =>
            hasFilterValue(value),
        ),
    );

    if (Object.keys(activeFilters).length > 0) {
        query.filters = activeFilters;
    }

    const requestQuery = props.panelKey ? { [props.panelKey]: query } : query;

    router.get(window.location.pathname, requestQuery, {
        only: props.panelKey ? [props.reloadProp ?? props.panelKey] : undefined,
        preserveScroll: true,
        preserveState: true,
        onStart: () => {
            isLoading.value = true;
        },
        onFinish: () => {
            isLoading.value = false;
        },
    });
}

function goToPage(page: number): void {
    if (page < 1 || page === props.records.current_page) {
        return;
    }

    if (
        props.records.last_page !== undefined &&
        page > props.records.last_page
    ) {
        return;
    }

    if (
        props.records.last_page === undefined &&
        ((page < props.records.current_page && !props.records.prev_page_url) ||
            (page > props.records.current_page && !props.records.next_page_url))
    ) {
        return;
    }

    navigate(page);
}

const hasPaginationControls = computed(
    () =>
        (props.records.last_page !== undefined &&
            props.records.last_page > 1) ||
        Boolean(props.records.prev_page_url || props.records.next_page_url),
);

const isLengthAwarePaginator = computed(
    () => props.records.total !== undefined,
);

function navigateDebounced(): void {
    clearTimeout(navigateTimer);
    navigateTimer = setTimeout(navigate, 400);
}

function handlePerPage(value: unknown): void {
    const next = Number(value);

    if (!Number.isInteger(next) || next === perPage.value) {
        return;
    }

    perPage.value = next;
    navigate();
}

function canClickRow(record: T): boolean {
    return Boolean(props.show) && canShowRecord(record);
}

function openRecord(record: T): void {
    if (!props.show) {
        return;
    }

    const href = props.show.href(record);

    router.visit(typeof href === 'string' ? href : href.url);
}

function handleSort(column: string): void {
    sortState.direction =
        sortState.column === column && sortState.direction === 'asc'
            ? 'desc'
            : 'asc';
    sortState.column = column;

    navigate();
}

function handleItemSort(event: Event): void {
    const [column, direction] = (event.target as HTMLSelectElement).value.split(
        ':',
    );

    if (!column || (direction !== 'asc' && direction !== 'desc')) {
        return;
    }

    sortState.column = column;
    sortState.direction = direction;
    navigate();
}

function handleSearch(value: string): void {
    searchValue.value = value;
    navigateDebounced();
}

function handleFilter(
    name: string,
    value: CrudFilterValue,
    immediate: boolean,
): void {
    filterValues[name] = value;

    if (immediate) {
        navigate();

        return;
    }

    navigateDebounced();
}

function handleClearFilters(): void {
    searchValue.value = '';

    for (const filter of props.schema.filters) {
        filterValues[filter.name] =
            props.fixedFilters[filter.name] ?? (filter.multiple ? [] : '');
    }

    navigate();
}
</script>

<template>
    <TooltipProvider :delay-duration="0">
        <div
            :class="[
                embedded
                    ? 'flex w-full flex-col gap-5'
                    : [
                          'mx-auto flex w-full flex-col gap-5 p-4 sm:p-6 lg:p-8',
                          layoutWidthClasses[schema.page_width],
                      ],
            ]"
        >
            <div
                v-if="
                    !embedded ||
                    exportHref ||
                    (schema.operations.create && create.can) ||
                    $slots['toolbar-actions']
                "
                class="flex flex-col gap-4 px-1 py-2 md:flex-row md:items-center md:justify-between"
            >
                <div v-if="!embedded" class="space-y-2">
                    <p
                        v-if="workspace"
                        class="text-[11px] font-semibold tracking-[0.18em] text-primary uppercase"
                    >
                        {{ t(workspace ?? '') }}
                    </p>
                    <h1
                        class="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
                    >
                        {{ schema.title }}
                    </h1>
                    <p
                        v-if="schema.description"
                        class="text-sm text-muted-foreground"
                    >
                        {{ schema.description }}
                    </p>
                </div>

                <div class="ml-auto flex items-center gap-2">
                    <slot name="toolbar-actions" />

                    <Button v-if="exportHref" variant="outline" as-child>
                        <a :href="exportHref">
                            <Download class="size-4" />
                            {{ t('Export CSV') }}
                        </a>
                    </Button>

                    <Link
                        v-if="
                            schema.operations.create &&
                            create.can &&
                            usesFullPageForms() &&
                            create.href
                        "
                        :href="create.href"
                        class="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium whitespace-nowrap text-primary-foreground shadow-lg shadow-indigo-500/20 transition-all hover:bg-primary/90"
                    >
                        <Plus class="size-4" />
                        {{ create.label ?? t('Create') }}
                    </Link>

                    <CrudFormDialog
                        v-else-if="schema.operations.create && create.can"
                        :action="create.action"
                        :fields="visibleFields"
                        :trigger-label="create.label ?? t('Create')"
                        :title="create.title ?? create.label ?? t('Create')"
                        :description="create.description"
                        :submit-label="
                            create.submitLabel ?? create.label ?? t('Create')
                        "
                        reset-on-success
                        :field-id-prefix="`${schema.resource}-create`"
                    >
                        <template #trigger>
                            <Button
                                type="button"
                                class="gap-2 shadow-lg shadow-indigo-500/20"
                            >
                                <Plus class="size-4" />
                                {{ create.label ?? t('Create') }}
                            </Button>
                        </template>
                        <template
                            v-for="field in visibleFields.filter((field) =>
                                hasSlot(`create-field-${field.name}`),
                            )"
                            :key="field.name"
                            #[`field-${field.name}`]="slotProps"
                        >
                            <slot
                                :name="`create-field-${field.name}`"
                                v-bind="slotProps"
                            />
                        </template>
                        <template #fields="slotProps">
                            <slot name="create-fields" v-bind="slotProps" />
                        </template>
                    </CrudFormDialog>
                </div>
            </div>

            <CrudTable
                :columns="visibleColumns"
                :records="records.data"
                :sort="sortState"
                :loading="isLoading"
                :items-class="itemsClass"
                :empty-label="schema.empty_label ?? t('No records found.')"
                :clickable="canClickRow"
                @sort="handleSort"
                @row-click="openRecord"
            >
                <template
                    v-if="
                        schema.search?.enabled ||
                        visibleFilters.length > 0 ||
                        ($slots.item && sortableColumns.length > 0)
                    "
                    #toolbar
                >
                    <div
                        class="flex flex-col gap-2 border-b border-border/70 px-3 py-2 sm:flex-row sm:items-center sm:px-4"
                    >
                        <div
                            v-if="schema.search?.enabled"
                            class="relative min-w-0 flex-1"
                        >
                            <Search
                                class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                                aria-hidden="true"
                            />
                            <Input
                                :id="`${schema.resource}-search`"
                                type="search"
                                :model-value="searchValue"
                                :placeholder="searchPlaceholder"
                                :aria-label="t('Search')"
                                class="w-full bg-muted/40 pl-9"
                                @update:model-value="
                                    (value) => handleSearch(String(value))
                                "
                            />
                        </div>

                        <div
                            :class="[
                                'flex items-center justify-end gap-2',
                                !schema.search?.enabled && 'w-full',
                            ]"
                        >
                            <label
                                v-if="$slots.item && sortableColumns.length > 0"
                                class="flex items-center gap-2 text-sm text-muted-foreground"
                            >
                                {{ t('Sort') }}
                                <select
                                    class="rounded-md border border-border bg-card px-2 py-1.5 text-foreground"
                                    :value="
                                        sortState.column
                                            ? `${sortState.column}:${sortState.direction}`
                                            : ''
                                    "
                                    @change="handleItemSort"
                                >
                                    <option value="" disabled>
                                        {{ t('Sort') }}
                                    </option>
                                    <template
                                        v-for="column in sortableColumns"
                                        :key="column.name"
                                    >
                                        <option :value="`${column.name}:asc`">
                                            {{ t(column.label) }} ↑
                                        </option>
                                        <option :value="`${column.name}:desc`">
                                            {{ t(column.label) }} ↓
                                        </option>
                                    </template>
                                </select>
                            </label>
                            <Button
                                v-if="hasActiveQuery"
                                type="button"
                                variant="ghost"
                                size="sm"
                                class="gap-1.5 text-muted-foreground hover:text-foreground"
                                @click="handleClearFilters"
                            >
                                <X class="size-3.5" />
                                {{ t('Clear filters') }}
                            </Button>
                            <Button
                                v-if="visibleFilters.length > 0"
                                type="button"
                                variant="ghost"
                                size="sm"
                                :aria-expanded="filtersOpen"
                                :aria-controls="`${schema.resource}-filters`"
                                class="gap-2 text-muted-foreground hover:text-foreground"
                                @click="filtersOpen = !filtersOpen"
                            >
                                <SlidersHorizontal class="size-3.5" />
                                {{ t('Filters') }}
                                <Badge
                                    v-if="activeFilterCount > 0"
                                    variant="secondary"
                                    class="min-w-5 justify-center rounded-full px-1.5 text-[10px]"
                                >
                                    {{ activeFilterCount }}
                                </Badge>
                                <ChevronDown
                                    class="size-3.5 transition-transform duration-300 ease-out"
                                    :class="filtersOpen && 'rotate-180'"
                                />
                            </Button>
                        </div>
                    </div>

                    <Transition
                        v-if="visibleFilters.length > 0"
                        enter-active-class="grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out"
                        enter-from-class="grid-rows-[0fr]"
                        enter-to-class="grid-rows-[1fr]"
                        leave-active-class="grid overflow-hidden transition-[grid-template-rows] duration-300 ease-in"
                        leave-from-class="grid-rows-[1fr]"
                        leave-to-class="grid-rows-[0fr]"
                    >
                        <div
                            v-show="filtersOpen"
                            :id="`${schema.resource}-filters`"
                            class="grid min-h-0 border-b border-border/70"
                        >
                            <div class="min-h-0 overflow-hidden">
                                <CrudFilters
                                    :search="schema.search"
                                    :filters="visibleFilters"
                                    :search-value="searchValue"
                                    :filter-values="visibleFilterValues"
                                    hide-search
                                    @search="handleSearch"
                                    @filter="handleFilter"
                                    @clear="handleClearFilters"
                                />
                            </div>
                        </div>
                    </Transition>
                </template>

                <template v-if="$slots.item" #item="slotProps">
                    <slot name="item" v-bind="slotProps" />
                </template>

                <template #empty>
                    <div class="flex flex-col items-center gap-3 py-2">
                        <p>
                            {{
                                hasActiveQuery
                                    ? t('No records match your filters.')
                                    : (schema.empty_label ??
                                      t('No records found.'))
                            }}
                        </p>
                        <Button
                            v-if="hasActiveQuery"
                            type="button"
                            variant="outline"
                            size="sm"
                            @click="handleClearFilters"
                        >
                            {{ t('Clear filters') }}
                        </Button>
                        <Link
                            v-else-if="
                                schema.operations.create &&
                                create.can &&
                                usesFullPageForms() &&
                                create.href
                            "
                            :href="create.href"
                            class="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                            <Plus class="size-4" />
                            {{ create.label ?? t('Create') }}
                        </Link>
                    </div>
                </template>

                <template
                    v-for="column in visibleColumns"
                    :key="column.name"
                    #[`cell-${column.name}`]="slotProps"
                >
                    <slot :name="`cell-${column.name}`" v-bind="slotProps">
                        <CrudCellValue
                            :column="column"
                            :record="slotProps.record"
                        />
                    </slot>
                </template>

                <template #actions="{ record }">
                    <div class="flex items-center justify-end gap-2">
                        <slot name="actions-before" :record="record" />

                        <Tooltip
                            v-if="show && canShowRecord(record)"
                            :ignore-non-keyboard-focus="true"
                        >
                            <TooltipTrigger as-child>
                                <Link
                                    :href="show.href(record)"
                                    class="inline-flex size-8 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                                    :aria-label="show.label ?? t('Show')"
                                    :title="show.title?.(record) ?? t('Show')"
                                >
                                    <component
                                        :is="show.icon ?? Eye"
                                        class="size-4"
                                    />
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent>{{
                                show.label ?? t('Show')
                            }}</TooltipContent>
                        </Tooltip>

                        <Tooltip
                            v-if="
                                canEditRecord(record) &&
                                usesFullPageForms() &&
                                edit.href
                            "
                            :ignore-non-keyboard-focus="true"
                        >
                            <TooltipTrigger as-child>
                                <Link
                                    :href="edit.href(record)"
                                    class="inline-flex size-8 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                                    :aria-label="edit.label ?? t('Edit')"
                                    :title="editRecordTitle(record)"
                                >
                                    <component
                                        :is="edit.icon ?? Pencil"
                                        class="size-4"
                                    />
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent>{{
                                edit.label ?? t('Edit')
                            }}</TooltipContent>
                        </Tooltip>

                        <CrudFormDialog
                            v-else-if="canEditRecord(record)"
                            :action="edit.action(record)"
                            :fields="visibleUpdateFields"
                            :initial-values="record"
                            :trigger-label="edit.label ?? t('Edit')"
                            :trigger-tooltip="edit.label ?? t('Edit')"
                            :title="editRecordTitle(record)"
                            :description="edit.description"
                            :submit-label="
                                edit.submitLabel ?? t('Save changes')
                            "
                            :field-id-prefix="recordFieldPrefix(record)"
                        >
                            <template #trigger>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="icon-sm"
                                    :aria-label="edit.label ?? t('Edit')"
                                >
                                    <component
                                        :is="edit.icon ?? Pencil"
                                        class="size-4"
                                    />
                                </Button>
                            </template>
                            <template
                                v-for="field in visibleUpdateFields.filter(
                                    (field) =>
                                        field.visible_on_update &&
                                        hasSlot(`edit-field-${field.name}`),
                                )"
                                :key="field.name"
                                #[`field-${field.name}`]="slotProps"
                            >
                                <slot
                                    :name="`edit-field-${field.name}`"
                                    :record="record"
                                    v-bind="slotProps"
                                />
                            </template>

                            <template #fields="slotProps">
                                <slot
                                    name="edit-fields"
                                    :record="record"
                                    v-bind="slotProps"
                                />
                            </template>
                        </CrudFormDialog>

                        <CrudDeleteDialog
                            v-if="canDestroyRecord(record)"
                            :action="destroy.action(record)"
                            :trigger-label="destroy.label ?? t('Delete')"
                            :title="destroyRecordTitle(record)"
                            :description="
                                destroy.description ??
                                t('This action cannot be undone.')
                            "
                            :confirm-label="
                                destroy.confirmLabel ??
                                destroy.label ??
                                t('Delete')
                            "
                            :cancel-label="destroy.cancelLabel ?? t('Cancel')"
                            :icon="destroy.icon"
                        />

                        <span
                            v-if="
                                !canShowRecord(record) &&
                                !canEditRecord(record) &&
                                !canDestroyRecord(record)
                            "
                            class="text-sm text-muted-foreground"
                        >
                            {{ lockedLabel ?? t('Locked') }}
                        </span>

                        <slot name="actions-after" :record="record" />
                    </div>
                </template>
                <template #footer>
                    <div
                        v-if="
                            hasPaginationControls ||
                            (records.total ?? 0) > perPageOptions[0]
                        "
                        class="flex flex-col gap-3 px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between"
                    >
                        <span>
                            <template v-if="isLengthAwarePaginator">
                                {{
                                    t('Showing :from to :to of :total', {
                                        from: records.from ?? 0,
                                        to: records.to ?? 0,
                                        total: records.total ?? 0,
                                    })
                                }}
                            </template>
                            <template v-else>
                                {{
                                    t('Showing :from to :to', {
                                        from: records.from ?? 0,
                                        to: records.to ?? 0,
                                    })
                                }}
                            </template>
                        </span>

                        <div
                            class="flex flex-wrap items-center justify-between gap-3 sm:justify-end"
                        >
                            <div class="flex items-center gap-2">
                                <span class="whitespace-nowrap">{{
                                    t('Rows per page')
                                }}</span>
                                <Select
                                    :model-value="String(perPage)"
                                    @update:model-value="handlePerPage"
                                >
                                    <SelectTrigger
                                        size="sm"
                                        class="w-[4.5rem]"
                                        :aria-label="t('Rows per page')"
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem
                                            v-for="option in perPageOptions"
                                            :key="option"
                                            :value="String(option)"
                                        >
                                            {{ option }}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                :disabled="!records.prev_page_url"
                                @click="goToPage(records.current_page - 1)"
                            >
                                <ChevronLeft class="size-4" />
                                {{ t('Previous') }}
                            </Button>

                            <span class="whitespace-nowrap">
                                <template
                                    v-if="records.last_page !== undefined"
                                >
                                    {{
                                        t('Page :current of :last', {
                                            current: records.current_page,
                                            last: records.last_page,
                                        })
                                    }}
                                </template>
                                <template v-else>
                                    {{
                                        t('Page :current', {
                                            current: records.current_page,
                                        })
                                    }}
                                </template>
                            </span>

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                :disabled="!records.next_page_url"
                                @click="goToPage(records.current_page + 1)"
                            >
                                {{ t('Next') }}
                                <ChevronRight class="size-4" />
                            </Button>
                        </div>
                    </div>
                </template>
            </CrudTable>
        </div>
    </TooltipProvider>
</template>
