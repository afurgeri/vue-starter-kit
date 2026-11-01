<script setup lang="ts">
import { Link } from '@inertiajs/vue3';
import { ArrowLeft } from '@lucide/vue';
import { useSlots } from 'vue';
import CrudField from '@/components/crud/CrudField.vue';
import CrudForm from '@/components/crud/CrudForm.vue';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/composables/useTranslation';
import type {
    CrudField as CrudFieldConfig,
    CrudFieldSlotProps,
    CrudHref,
    CrudSchema,
    FormAction,
} from '@/types/crud';

type CrudFormPageFieldsSlotProps = {
    errors: Record<string, string | undefined>;
    readOnly: boolean;
    values: Readonly<Record<string, unknown>>;
};

defineSlots<{
    fields(props: CrudFormPageFieldsSlotProps): unknown;
    [name: `field-${string}`]: (props: CrudFieldSlotProps) => unknown;
}>();

withDefaults(
    defineProps<{
        schema: CrudSchema;
        action?: FormAction;
        backHref: CrudHref;
        title: string;
        submitLabel: string;
        description?: string;
        initialValues?: Record<string, unknown>;
        fields?: CrudFieldConfig[];
        fieldIdPrefix?: string;
        readOnly?: boolean;
        fieldsAfter?: string[];
    }>(),
    {
        description: undefined,
        initialValues: () => ({}),
        fields: undefined,
        fieldIdPrefix: undefined,
        readOnly: false,
        fieldsAfter: () => [],
    },
);

const { t } = useTranslation();

const layoutWidthClasses = {
    standard: 'max-w-7xl',
    wide: 'max-w-screen-2xl',
    full: 'max-w-none',
} as const;

const slots = useSlots();

function hasFieldSlot(fieldName: string): boolean {
    return Boolean(slots[`field-${fieldName}`]);
}

function fieldDefault(
    field: CrudFieldConfig,
    initialValues: Record<string, unknown>,
): unknown {
    if (Object.prototype.hasOwnProperty.call(initialValues, field.name)) {
        return initialValues[field.name];
    }

    return field.defaultValue;
}
</script>

<template>
    <div
        :class="[
            'mx-auto flex w-full flex-col gap-6 p-4 sm:p-6 lg:p-8',
            layoutWidthClasses[schema.form_width],
        ]"
    >
        <div class="flex items-center gap-3">
            <Button as-child variant="ghost" size="icon-sm">
                <Link
                    :href="backHref"
                    :aria-label="t('Back to :name', { name: schema.title })"
                >
                    <ArrowLeft class="size-4" />
                </Link>
            </Button>

            <div>
                <p class="text-sm text-muted-foreground">{{ schema.title }}</p>
                <h1
                    class="text-3xl font-semibold tracking-tight text-foreground"
                >
                    {{ title }}
                </h1>
            </div>
        </div>

        <section
            class="rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-8"
        >
            <p v-if="description" class="mb-6 text-sm text-muted-foreground">
                {{ description }}
            </p>

            <CrudForm
                v-if="!readOnly && action"
                :action="action"
                :fields="fields ?? schema.fields"
                :initial-values="initialValues"
                :submit-label="submitLabel"
                :field-id-prefix="fieldIdPrefix"
                :fields-after="fieldsAfter"
                form-class="grid w-full grid-cols-12 gap-6"
                guard-navigation
            >
                <template #cancel>
                    <Button as-child variant="outline">
                        <Link :href="backHref">{{ t('Cancel') }}</Link>
                    </Button>
                </template>
                <template
                    v-for="field in (fields ?? schema.fields).filter((field) =>
                        hasFieldSlot(field.name),
                    )"
                    :key="field.name"
                    #[`field-${field.name}`]="slotProps"
                >
                    <slot :name="`field-${field.name}`" v-bind="slotProps" />
                </template>
                <template #fields="slotProps">
                    <slot
                        name="fields"
                        :errors="slotProps.errors"
                        :read-only="false"
                        :values="slotProps.values"
                    />
                </template>
            </CrudForm>

            <div v-else class="grid w-full grid-cols-12 gap-6">
                <CrudField
                    v-for="field in (fields ?? schema.fields).filter(
                        (field) => !fieldsAfter.includes(field.name),
                    )"
                    :key="field.name"
                    :field="field"
                    :default-value="fieldDefault(field, initialValues)"
                    :values="initialValues"
                    :id-prefix="fieldIdPrefix"
                    read-only
                >
                    <template
                        v-if="hasFieldSlot(field.name)"
                        #default="slotProps"
                    >
                        <slot
                            :name="`field-${field.name}`"
                            v-bind="slotProps"
                        />
                    </template>
                </CrudField>

                <div class="col-span-12">
                    <slot
                        name="fields"
                        :errors="{}"
                        :read-only="true"
                        :values="initialValues"
                    />
                </div>

                <CrudField
                    v-for="field in (fields ?? schema.fields).filter((field) =>
                        fieldsAfter.includes(field.name),
                    )"
                    :key="field.name"
                    :field="field"
                    :default-value="fieldDefault(field, initialValues)"
                    :values="initialValues"
                    :id-prefix="fieldIdPrefix"
                    read-only
                >
                    <template
                        v-if="hasFieldSlot(field.name)"
                        #default="slotProps"
                    >
                        <slot
                            :name="`field-${field.name}`"
                            v-bind="slotProps"
                        />
                    </template>
                </CrudField>
            </div>
        </section>
    </div>
</template>
