<script setup lang="ts">
import { computed } from 'vue';
import CrudBadge from '@/components/crud/CrudBadge.vue';
import {
    crudBadgeVariant,
    formatCrudColumnValue,
} from '@/composables/useCrudFormat';
import type { CrudColumn, CrudRecord } from '@/types/crud';

const props = defineProps<{
    column: CrudColumn;
    record: CrudRecord;
}>();

const value = computed(() => props.record[props.column.name]);
const display = computed(() =>
    formatCrudColumnValue(props.column, props.record),
);
</script>

<template>
    <CrudBadge
        v-if="
            column.badges &&
            value !== null &&
            value !== undefined &&
            value !== ''
        "
        :variant="crudBadgeVariant(column, value)"
    >
        {{ display }}
    </CrudBadge>
    <span
        v-else-if="column.type === 'money'"
        class="whitespace-nowrap tabular-nums"
        >{{ display }}</span
    >
    <template v-else>{{ display }}</template>
</template>
