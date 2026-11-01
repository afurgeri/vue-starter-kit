<script setup lang="ts">
import { Form, router } from '@inertiajs/vue3';
import {
    computed,
    nextTick,
    onBeforeUnmount,
    onMounted,
    reactive,
    ref,
    useSlots,
} from 'vue';
import { toast } from 'vue-sonner';
import CrudField from '@/components/crud/CrudField.vue';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/composables/useTranslation';
import type { CrudField as CrudFieldConfig, FormAction } from '@/types/crud';

const props = withDefaults(
    defineProps<{
        action: FormAction;
        fields: CrudFieldConfig[];
        initialValues?: Record<string, unknown>;
        submitLabel: string;
        resetOnSuccess?: boolean;
        readOnly?: boolean;
        formClass?: string;
        fieldLabelClass?: string;
        fieldIdPrefix?: string;
        fieldsAfter?: string[];
        cancelable?: boolean;
        cancelLabel?: string;
        guardNavigation?: boolean;
    }>(),
    {
        initialValues: () => ({}),
        resetOnSuccess: false,
        readOnly: false,
        formClass: 'grid grid-cols-12 gap-4',
        fieldLabelClass: undefined,
        fieldIdPrefix: undefined,
        fieldsAfter: () => [],
        cancelable: false,
        cancelLabel: undefined,
        guardNavigation: false,
    },
);

const { t } = useTranslation();
const formRef = ref<{
    $el: HTMLElement;
    isDirty: boolean;
} | null>(null);
const initialSnapshot = ref<string | null>(null);

const fieldRenderKey = ref(0);
const fieldValues = reactive<Record<string, unknown>>({});
const slots = useSlots();

function hasFieldSlot(fieldName: string): boolean {
    return Boolean(slots[`field-${fieldName}`]);
}

const emit = defineEmits<{
    success: [];
    cancel: [];
}>();

function fieldDefault(field: CrudFieldConfig): unknown {
    if (Object.prototype.hasOwnProperty.call(props.initialValues, field.name)) {
        return props.initialValues[field.name];
    }

    return field.defaultValue;
}

for (const field of props.fields) {
    fieldValues[field.name] = fieldDefault(field);
}

function handleFieldValue(name: string, value: unknown): void {
    fieldValues[name] = value;
}

const fieldsBefore = computed(() =>
    props.fields.filter(
        (field) => field.visible && !props.fieldsAfter.includes(field.name),
    ),
);

const fieldsAfter = computed(() =>
    props.fields.filter(
        (field) => field.visible && props.fieldsAfter.includes(field.name),
    ),
);

function snapshot(): string {
    // An untouched field and one the user emptied again are the same value.
    const normalize = (value: unknown): unknown =>
        value === undefined || value === '' ? null : value;

    return JSON.stringify(
        Object.keys(fieldValues)
            .sort()
            .map((name) => [name, normalize(fieldValues[name])]),
    );
}

/**
 * True when the user changed a value since the form was shown. Field values
 * cover the CRUD fields, Inertia's own tracking covers custom inputs rendered
 * through the `fields` slot.
 */
const isDirty = computed(
    () =>
        (initialSnapshot.value !== null &&
            snapshot() !== initialSnapshot.value) ||
        Boolean(formRef.value?.isDirty),
);

defineExpose({ isDirty });

async function markClean(): Promise<void> {
    await nextTick();
    initialSnapshot.value = snapshot();
}

function warnBeforeUnload(event: BeforeUnloadEvent): void {
    if (isDirty.value) {
        event.preventDefault();
        event.returnValue = '';
    }
}

let removeBeforeVisit: (() => void) | undefined;

onMounted(() => {
    void markClean();

    if (!props.guardNavigation) {
        return;
    }

    removeBeforeVisit = router.on('before', (event) => {
        const visit = event.detail.visit;

        if (
            !isDirty.value ||
            visit.method !== 'get' ||
            visit.only.length > 0 ||
            visit.preserveState === true
        ) {
            return;
        }

        if (
            !window.confirm(
                t(
                    'You have unsaved changes. Do you want to leave without saving?',
                ),
            )
        ) {
            event.preventDefault();
        }
    });
    window.addEventListener('beforeunload', warnBeforeUnload);
});

onBeforeUnmount(() => {
    removeBeforeVisit?.();
    window.removeEventListener('beforeunload', warnBeforeUnload);
});

function errorTarget(
    root: HTMLElement,
    errors: Record<string, string>,
): HTMLElement | null {
    const isVisible = (element: HTMLElement): boolean =>
        element.getClientRects().length > 0;
    const invalid = Array.from(
        root.querySelectorAll<HTMLElement>('[aria-invalid="true"]'),
    ).find(isVisible);

    if (invalid) {
        return invalid;
    }

    for (const key of Object.keys(errors)) {
        const bracketed = key.replace(/\.([^.]+)/g, '[$1]');
        const match = Array.from(
            root.querySelectorAll<HTMLElement>(
                [key, bracketed, `${key}[]`, `${bracketed}[]`]
                    .map((name) => `[name="${CSS.escape(name)}"]`)
                    .join(','),
            ),
        ).find(isVisible);

        if (match) {
            return match;
        }
    }

    return null;
}

async function handleError(errors: Record<string, string>): Promise<void> {
    toast.error(t('Please fix the highlighted fields.'));
    await nextTick();

    const root = formRef.value?.$el as HTMLElement | undefined;
    const target = root ? (errorTarget(root, errors) ?? root) : null;

    target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    target?.focus({ preventScroll: true });
}

function handleSuccess(): void {
    if (props.resetOnSuccess) {
        for (const field of props.fields) {
            fieldValues[field.name] = fieldDefault(field);
        }

        fieldRenderKey.value += 1;
    }

    void markClean();
    emit('success');
}
</script>

<template>
    <Form
        ref="formRef"
        v-bind="action"
        :reset-on-success="resetOnSuccess"
        :class="formClass"
        v-slot="{ errors, processing }"
        @success="handleSuccess"
        @error="handleError"
    >
        <CrudField
            v-for="field in fieldsBefore"
            :key="`${field.name}-${fieldRenderKey}`"
            :field="field"
            :read-only="readOnly"
            :error="errors[field.name]"
            :default-value="fieldDefault(field)"
            :values="fieldValues"
            :label-class="fieldLabelClass"
            :id-prefix="fieldIdPrefix"
            @value-change="handleFieldValue"
        >
            <template v-if="hasFieldSlot(field.name)" #default="slotProps">
                <slot :name="`field-${field.name}`" v-bind="slotProps" />
            </template>
        </CrudField>

        <div class="col-span-12">
            <slot name="fields" :errors="errors" :values="fieldValues" />
        </div>

        <CrudField
            v-for="field in fieldsAfter"
            :key="`${field.name}-${fieldRenderKey}`"
            :field="field"
            :read-only="readOnly"
            :error="errors[field.name]"
            :default-value="fieldDefault(field)"
            :values="fieldValues"
            :label-class="fieldLabelClass"
            :id-prefix="fieldIdPrefix"
            @value-change="handleFieldValue"
        >
            <template v-if="hasFieldSlot(field.name)" #default="slotProps">
                <slot :name="`field-${field.name}`" v-bind="slotProps" />
            </template>
        </CrudField>

        <div
            v-if="!readOnly"
            class="col-span-12 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"
        >
            <slot name="cancel">
                <Button
                    v-if="cancelable"
                    type="button"
                    variant="outline"
                    :disabled="processing"
                    @click="emit('cancel')"
                >
                    {{ cancelLabel ?? t('Cancel') }}
                </Button>
            </slot>
            <Button type="submit" :disabled="processing">
                {{ submitLabel }}
            </Button>
        </div>
    </Form>
</template>
