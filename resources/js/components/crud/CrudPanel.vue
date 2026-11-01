<script setup lang="ts" generic="T extends CrudRecord">
import { useSlots } from 'vue';
import CrudPage from '@/components/crud/CrudPage.vue';
import type {
    CrudCreateConfig,
    CrudDestroyConfig,
    CrudEditConfig,
    CrudFilterValue,
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
        panelKey: string;
        fullPageForms?: boolean;
        reloadProp?: string;
        hiddenFilters?: string[];
        hiddenColumns?: string[];
        hiddenFields?: string[];
        fixedFilters?: Record<string, CrudFilterValue>;
        lockedLabel?: string;
        itemsClass?: string;
    }>(),
    {
        reloadProp: undefined,
        hiddenFilters: () => [],
        hiddenColumns: () => [],
        hiddenFields: () => [],
        fixedFilters: () => ({}),
        lockedLabel: undefined,
        fullPageForms: undefined,
    },
);

const slots = useSlots();
</script>

<template>
    <CrudPage v-bind="props" embedded>
        <template v-for="(_, name) in slots" #[name]="slotProps">
            <slot :name="name" v-bind="slotProps ?? {}" />
        </template>
    </CrudPage>
</template>
