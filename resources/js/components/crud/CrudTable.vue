<script setup lang="ts" generic="T extends CrudRecord">
import { ChevronDown, ChevronUp } from '@lucide/vue';
import { computed, useSlots } from 'vue';
import CrudCellValue from '@/components/crud/CrudCellValue.vue';
import { useTranslation } from '@/composables/useTranslation';
import type { CrudColumn, CrudRecord, CrudSort } from '@/types/crud';

const props = withDefaults(
    defineProps<{
        columns: CrudColumn[];
        records: T[];
        sort?: CrudSort;
        actionsLabel?: string;
        emptyLabel?: string;
        loading?: boolean;
        clickable?: (record: T) => boolean;
        itemsClass?: string;
    }>(),
    {
        loading: false,
        clickable: undefined,
    },
);

const emit = defineEmits<{
    sort: [column: string];
    'row-click': [record: T];
}>();

const interactiveSelector =
    'a, button, input, select, textarea, label, summary, [role="button"], [data-row-click="ignore"]';

function isClickable(record: T): boolean {
    return props.clickable?.(record) ?? false;
}

function handleRowClick(event: MouseEvent, record: T): void {
    if (!isClickable(record)) {
        return;
    }

    if (
        event.target instanceof Element &&
        event.target.closest(interactiveSelector)
    ) {
        return;
    }

    if (window.getSelection()?.toString()) {
        return;
    }

    emit('row-click', record);
}

const mobileColumns = computed(() => {
    const flagged = props.columns.filter((column) => column.mobile === true);
    const primary = flagged.length > 0 ? flagged : props.columns.slice(0, 4);

    return {
        primary,
        secondary: props.columns.filter((column) => !primary.includes(column)),
    };
});

function ariaSort(
    column: CrudColumn,
): 'ascending' | 'descending' | 'none' | undefined {
    if (!column.sortable) {
        return undefined;
    }

    if (props.sort?.column !== column.name) {
        return 'none';
    }

    return props.sort.direction === 'asc' ? 'ascending' : 'descending';
}

// Keep the list height stable while a new page of results is loading.
const loadingRows = computed(() => Math.max(props.records.length, 1));
const { t } = useTranslation();
const slots = useSlots();

const RecordActions = ({ record }: { record: T }) =>
    slots.actions?.({ record });

function columnStyle(column: CrudColumn): Record<string, string> {
    const style: Record<string, string> = {};

    if (column.width !== undefined) {
        style.width = column.width;
    }

    if (column.min_width !== undefined) {
        style.minWidth = column.min_width;
    }

    if (column.max_width !== undefined) {
        style.maxWidth = column.max_width;
    }

    return style;
}
</script>

<template>
    <div
        class="overflow-hidden rounded-xl border border-border/70 bg-card shadow-[0_12px_32px_-24px_rgba(15,23,42,0.35)]"
    >
        <div v-if="$slots.toolbar">
            <slot name="toolbar" />
        </div>

        <template v-if="$slots.item">
            <div
                v-if="loading"
                :class="
                    itemsClass ??
                    'grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3'
                "
                aria-hidden="true"
            >
                <div
                    v-for="row in loadingRows"
                    :key="row"
                    class="h-48 animate-pulse rounded-xl bg-muted"
                />
            </div>
            <div
                v-else-if="records.length > 0"
                :class="
                    itemsClass ??
                    'grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3'
                "
            >
                <template v-for="record in records" :key="record.id">
                    <slot
                        name="item"
                        :record="record"
                        :Actions="RecordActions"
                    />
                </template>
            </div>
            <div v-else class="px-5 py-12 text-center text-muted-foreground">
                <slot name="empty">
                    {{ emptyLabel ?? t('No records found.') }}
                </slot>
            </div>
            <div v-if="$slots.footer" class="border-t border-border/70">
                <slot name="footer" />
            </div>
        </template>

        <div v-else class="hidden overflow-x-auto md:block">
            <table class="w-full text-left text-sm">
                <thead class="border-b bg-muted/30 text-muted-foreground">
                    <tr>
                        <th
                            v-for="column in columns"
                            :key="column.name"
                            scope="col"
                            :aria-sort="ariaSort(column)"
                            class="px-4 py-3 text-[11px] font-semibold tracking-wide"
                            :style="columnStyle(column)"
                        >
                            <button
                                v-if="column.sortable"
                                type="button"
                                class="inline-flex items-center gap-1 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                @click="$emit('sort', column.name)"
                            >
                                {{ t(column.label) }}
                                <ChevronUp
                                    v-if="
                                        sort?.column === column.name &&
                                        sort?.direction === 'asc'
                                    "
                                    class="size-3.5"
                                />
                                <ChevronDown
                                    v-else-if="
                                        sort?.column === column.name &&
                                        sort?.direction === 'desc'
                                    "
                                    class="size-3.5"
                                />
                            </button>
                            <template v-else>
                                {{ t(column.label) }}
                            </template>
                        </th>
                        <th
                            scope="col"
                            class="px-4 py-3 text-right text-[11px] font-semibold tracking-wide uppercase"
                        >
                            {{ actionsLabel ?? t('Actions') }}
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-border/70">
                    <template v-if="loading">
                        <tr
                            v-for="row in loadingRows"
                            :key="row"
                            aria-hidden="true"
                        >
                            <td
                                v-for="column in columns"
                                :key="column.name"
                                class="px-5 py-3"
                            >
                                <div
                                    class="h-4 w-3/4 animate-pulse rounded bg-muted"
                                />
                            </td>
                            <td class="px-5 py-3">
                                <div
                                    class="ml-auto h-8 w-16 animate-pulse rounded-lg bg-muted"
                                />
                            </td>
                        </tr>
                    </template>
                    <tr
                        v-else
                        v-for="record in records"
                        :key="record.id"
                        :class="[
                            'transition-colors hover:bg-indigo-50/40 dark:hover:bg-indigo-400/5',
                            isClickable(record) && 'cursor-pointer',
                        ]"
                        @click="handleRowClick($event, record)"
                    >
                        <td
                            v-for="column in columns"
                            :key="column.name"
                            class="px-5 py-3"
                            :style="columnStyle(column)"
                        >
                            <slot
                                :name="`cell-${column.name}`"
                                :column="column"
                                :record="record"
                                :value="record[column.name]"
                            >
                                <CrudCellValue
                                    :column="column"
                                    :record="record"
                                />
                            </slot>
                        </td>
                        <td class="px-5 py-3 text-right">
                            <slot name="actions" :record="record" />
                        </td>
                    </tr>
                    <tr v-if="!loading && records.length === 0">
                        <td
                            :colspan="columns.length + 1"
                            class="px-5 py-12 text-center text-muted-foreground"
                        >
                            <slot name="empty">
                                {{ emptyLabel ?? t('No records found.') }}
                            </slot>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div v-if="$slots.footer" class="border-t border-border/70">
                <slot name="footer" />
            </div>
        </div>

        <div v-if="!$slots.item" class="flex flex-col gap-3 p-3 md:hidden">
            <template v-if="loading">
                <div
                    v-for="row in loadingRows"
                    :key="row"
                    class="rounded-xl border border-border/70 bg-card p-4 shadow-sm"
                    aria-hidden="true"
                >
                    <div class="flex flex-col gap-3">
                        <div class="h-4 w-2/3 animate-pulse rounded bg-muted" />
                        <div class="h-4 w-1/2 animate-pulse rounded bg-muted" />
                        <div
                            class="h-8 w-20 animate-pulse self-end rounded-lg bg-muted"
                        />
                    </div>
                </div>
            </template>
            <div
                v-else
                v-for="record in records"
                :key="record.id"
                :class="[
                    'rounded-xl border border-border/70 bg-card p-4 shadow-sm',
                    isClickable(record) && 'cursor-pointer',
                ]"
                @click="handleRowClick($event, record)"
            >
                <dl class="flex flex-col gap-2">
                    <div
                        v-for="column in mobileColumns.primary"
                        :key="column.name"
                        class="flex items-baseline justify-between gap-4"
                    >
                        <dt
                            class="shrink-0 text-xs font-medium text-muted-foreground"
                        >
                            {{ t(column.label) }}
                        </dt>
                        <dd class="text-right text-sm break-words">
                            <slot
                                :name="`cell-${column.name}`"
                                :column="column"
                                :record="record"
                                :value="record[column.name]"
                            >
                                <CrudCellValue
                                    :column="column"
                                    :record="record"
                                />
                            </slot>
                        </dd>
                    </div>
                </dl>

                <details
                    v-if="mobileColumns.secondary.length > 0"
                    class="group mt-2"
                >
                    <summary
                        class="cursor-pointer py-1 text-xs font-medium text-primary select-none"
                    >
                        {{ t('More details') }}
                    </summary>
                    <dl class="mt-2 flex flex-col gap-2">
                        <div
                            v-for="column in mobileColumns.secondary"
                            :key="column.name"
                            class="flex items-baseline justify-between gap-4"
                        >
                            <dt
                                class="shrink-0 text-xs font-medium text-muted-foreground"
                            >
                                {{ t(column.label) }}
                            </dt>
                            <dd class="text-right text-sm break-words">
                                <slot
                                    :name="`cell-${column.name}`"
                                    :column="column"
                                    :record="record"
                                    :value="record[column.name]"
                                >
                                    <CrudCellValue
                                        :column="column"
                                        :record="record"
                                    />
                                </slot>
                            </dd>
                        </div>
                    </dl>
                </details>

                <div
                    class="mt-3 flex flex-wrap items-center justify-end gap-2 border-t border-border/70 pt-3"
                >
                    <slot name="actions" :record="record" />
                </div>
            </div>

            <div
                v-if="!loading && records.length === 0"
                class="rounded-xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground"
            >
                <slot name="empty">
                    {{ emptyLabel ?? t('No records found.') }}
                </slot>
            </div>

            <div v-if="$slots.footer">
                <slot name="footer" />
            </div>
        </div>
    </div>
</template>
