<script setup lang="ts">
import { X } from '@lucide/vue';
import { computed, ref, watch } from 'vue';
import CrudCombobox from '@/components/crud/CrudCombobox.vue';
import CrudComboboxMultiple from '@/components/crud/CrudComboboxMultiple.vue';
import CrudSelectMultiple from '@/components/crud/CrudSelectMultiple.vue';
import MobileCrudPicker from '@/components/crud/MobileCrudPicker.vue';
import RemoteCombobox from '@/components/crud/RemoteCombobox.vue';
import InputError from '@/components/InputError.vue';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { formatCrudDateTimeLocal } from '@/composables/useCrudTemporal';
import { useTranslation } from '@/composables/useTranslation';
import type { CrudField, CrudFieldSlotProps } from '@/types/crud';

const props = withDefaults(
    defineProps<{
        field: CrudField;
        error?: string;
        defaultValue?: unknown;
        values?: Readonly<Record<string, unknown>>;
        readOnly?: boolean;
        labelClass?: string;
        idPrefix?: string;
    }>(),
    {
        values: () => ({}),
        readOnly: false,
    },
);

const emit = defineEmits<{
    'value-change': [name: string, value: unknown];
}>();

defineSlots<{
    default(props: CrudFieldSlotProps): unknown;
}>();

type CrudFieldBreakpoint = 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const spanClassesByBreakpoint: Record<CrudFieldBreakpoint, string[]> = {
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

const checkboxValue = ref(booleanValue(props.defaultValue));
const selectValue = ref(optionValue(props.defaultValue));
const textValue = ref(fieldInputValue(props.field, props.defaultValue));
const confirmationValue = ref('');
const remoteSelectValue = computed({
    get: () => selectValue.value ?? '',
    set: (value: string) => {
        selectValue.value = value;
    },
});
const arrayValues = ref(arrayValue(props.defaultValue));
const multipleValues = ref(arrayValue(props.defaultValue));
const arrayInputValue = ref('');
const arrayInputError = ref<string>();
const arrayCleared = ref(false);
const { t } = useTranslation();
const clearButtonClass =
    'absolute top-1/2 right-2 z-10 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none';
const nativeIndicatorClearButtonClass =
    'absolute top-1/2 right-10 z-10 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none';
const selectClearButtonClass =
    'absolute top-1/2 right-8 z-10 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none';
const textareaClearButtonClass =
    'absolute top-2 right-2 z-10 inline-flex size-6 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none';

const fieldId = computed(() =>
    props.idPrefix ? `${props.idPrefix}-${props.field.name}` : props.field.name,
);

const errorId = computed(() => `${fieldId.value}-error`);

const dependencyValues = computed(() =>
    Object.fromEntries(
        (props.field.depends_on ?? []).map((name) => [
            name,
            props.values[name],
        ]),
    ),
);

const isDependencyMissing = computed(() =>
    Object.values(dependencyValues.value).some(
        (value) =>
            value === null ||
            value === undefined ||
            value === '' ||
            (Array.isArray(value) && value.length === 0),
    ),
);

const disabled = computed(
    () => Boolean(props.readOnly) || isDependencyMissing.value,
);

const availableOptions = computed(() => {
    const options = props.field.options ?? [];

    if ((props.field.depends_on ?? []).length === 0) {
        return options;
    }

    if (isDependencyMissing.value) {
        return [];
    }

    return options.filter((option) =>
        Object.entries(dependencyValues.value).every(
            ([name, value]) => String(option[name]) === String(value),
        ),
    );
});

const currentValue = computed(() => {
    if (props.field.type === 'checkbox') {
        return checkboxValue.value;
    }

    if (props.field.type === 'array') {
        return arrayValues.value;
    }

    if (props.field.multiple) {
        return multipleValues.value;
    }

    if (['select', 'combobox', 'remote-select'].includes(props.field.type)) {
        return selectValue.value;
    }

    return textValue.value;
});

function setValue(value: unknown): void {
    if (props.field.type === 'checkbox') {
        checkboxValue.value = booleanValue(value);
    } else if (props.field.type === 'array') {
        arrayValues.value = arrayValue(value);
    } else if (props.field.multiple) {
        multipleValues.value = arrayValue(value);
    } else if (
        ['select', 'combobox', 'remote-select'].includes(props.field.type)
    ) {
        selectValue.value = optionValue(value);
    } else {
        textValue.value = inputValue(value) ?? '';
    }
}

watch(currentValue, (value) => emit('value-change', props.field.name, value), {
    deep: true,
});

watch(
    dependencyValues,
    () => {
        if ((props.field.depends_on ?? []).length > 0) {
            clearValue();
        }
    },
    { deep: true },
);

watch(
    () => props.defaultValue,
    (value) => {
        checkboxValue.value = booleanValue(value);
        textValue.value = fieldInputValue(props.field, value);
    },
);

watch(
    () => props.defaultValue,
    (value) => {
        selectValue.value = optionValue(value);
        multipleValues.value = arrayValue(value);
    },
);

watch(
    () => props.defaultValue,
    (value) => {
        arrayValues.value = arrayValue(value);
        arrayInputValue.value = '';
        arrayInputError.value = undefined;
        arrayCleared.value = false;
    },
);

const hasClearableValue = computed(() => {
    if (!props.field.clearable || props.readOnly) {
        return false;
    }

    if (props.field.type === 'checkbox') {
        return checkboxValue.value;
    }

    if (props.field.type === 'array') {
        return arrayValues.value.length > 0 || arrayInputValue.value !== '';
    }

    if (props.field.multiple) {
        return multipleValues.value.length > 0;
    }

    if (['select', 'combobox', 'remote-select'].includes(props.field.type)) {
        return selectValue.value !== undefined && selectValue.value !== '';
    }

    return textValue.value !== undefined && textValue.value !== '';
});

function inputValue(value: unknown): string | number | undefined {
    return typeof value === 'string' || typeof value === 'number'
        ? value
        : undefined;
}

function htmlInputType(type: CrudField['type']): string {
    return type === 'datetime' ? 'datetime-local' : type;
}

function hasNativeIndicator(type: CrudField['type']): boolean {
    return ['number', 'date', 'time', 'datetime'].includes(type);
}

function clearButtonClassForField(field: CrudField): string {
    return hasNativeIndicator(field.type)
        ? nativeIndicatorClearButtonClass
        : clearButtonClass;
}

function inputClassForField(field: CrudField): string | undefined {
    if (hasNativeIndicator(field.type)) {
        return 'pr-4';
    }

    return hasClearableValue.value ? 'pr-9' : undefined;
}

function fieldInputValue(
    field: CrudField,
    value: unknown,
): string | number | undefined {
    const normalized = inputValue(value);

    if (typeof normalized !== 'string') {
        return normalized;
    }

    if (field.type === 'date') {
        return normalized.slice(0, 10);
    }

    if (field.type === 'time') {
        return normalized.slice(0, 5);
    }

    if (field.type !== 'datetime') {
        return normalized;
    }

    return formatCrudDateTimeLocal(normalized, field.timezone ?? 'UTC');
}

function spanClasses(span: CrudField['span']): string[] {
    return (Object.entries(span) as [CrudFieldBreakpoint, number][]).flatMap(
        ([breakpoint, columns]) =>
            spanClassesByBreakpoint[breakpoint]?.[columns - 1] ?? [],
    );
}

function booleanValue(value: unknown): boolean {
    return value === true || value === 1 || value === '1';
}

function optionValue(value: unknown): string | undefined {
    if (value === null || value === undefined) {
        return undefined;
    }

    if (typeof value === 'boolean') {
        return value ? '1' : '0';
    }

    return typeof value === 'string' || typeof value === 'number'
        ? String(value)
        : undefined;
}

function arrayValue(value: unknown): string[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .filter(
            (item): item is string | number =>
                typeof item === 'string' || typeof item === 'number',
        )
        .map(String);
}

function addArrayValue(): void {
    const value = arrayInputValue.value.trim();

    if (value === '') {
        return;
    }

    if (props.field.unique_items && arrayValues.value.includes(value)) {
        arrayInputError.value = t('This value is already included.');

        return;
    }

    arrayValues.value.push(value);
    arrayInputValue.value = '';
    arrayInputError.value = undefined;
}

function removeArrayValue(index: number): void {
    arrayValues.value.splice(index, 1);
    arrayInputError.value = undefined;
}

function clearValue(): void {
    switch (props.field.type) {
        case 'checkbox':
            checkboxValue.value = false;
            break;
        case 'array':
            arrayValues.value = [];
            arrayInputValue.value = '';
            arrayInputError.value = undefined;
            arrayCleared.value = true;
            break;
        case 'select':
        case 'combobox':
            if (props.field.multiple) {
                multipleValues.value = [];

                break;
            }

            selectValue.value = undefined;
            break;
        case 'remote-select':
            selectValue.value = undefined;
            break;
        default:
            textValue.value = '';
            confirmationValue.value = '';
            break;
    }
}
</script>

<template>
    <div v-if="field.visible" class="contents">
        <div :class="['space-y-2', spanClasses(field.span)]">
            <Label :for="fieldId" :class="labelClass"
                >{{ field.label
                }}<span
                    v-if="field.required && !readOnly"
                    class="ml-0.5 text-destructive"
                    aria-hidden="true"
                    >*</span
                ></Label
            >
            <slot
                v-if="$slots.default"
                v-bind="{
                    field,
                    id: fieldId,
                    name: field.name,
                    defaultValue,
                    error,
                    required: field.required,
                    readOnly: readOnly ?? false,
                    value: currentValue,
                    values,
                    dependencies: dependencyValues,
                    options: availableOptions,
                    disabled,
                    setValue,
                    clear: clearValue,
                }"
            />
            <template v-if="!$slots.default && field.type === 'array'">
                <div v-if="readOnly" class="flex flex-wrap gap-2">
                    <span
                        v-for="value in arrayValues"
                        :key="value"
                        class="rounded-md bg-muted px-2 py-1 text-sm"
                    >
                        {{ value }}
                    </span>
                    <span
                        v-if="arrayValues.length === 0"
                        class="text-sm text-muted-foreground"
                    >
                        {{ t('No values.') }}
                    </span>
                </div>

                <div v-else class="space-y-2">
                    <div class="flex items-center gap-2">
                        <div class="relative min-w-0 flex-1">
                            <Input
                                :id="
                                    idPrefix
                                        ? `${idPrefix}-${field.name}`
                                        : field.name
                                "
                                v-model="arrayInputValue"
                                :required="
                                    field.required && arrayValues.length === 0
                                "
                                :disabled="disabled"
                                :aria-invalid="
                                    error || arrayInputError
                                        ? 'true'
                                        : undefined
                                "
                                :class="hasClearableValue ? 'pr-9' : undefined"
                                @keydown.enter.prevent="addArrayValue"
                            />
                            <button
                                v-if="hasClearableValue"
                                type="button"
                                :class="clearButtonClass"
                                :aria-label="
                                    t('Clear :label', { label: field.label })
                                "
                                @click="clearValue"
                            >
                                <X class="size-3.5" />
                            </button>
                        </div>
                        <button
                            type="button"
                            class="rounded-md border border-input px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                            :disabled="
                                readOnly || arrayInputValue.trim() === ''
                            "
                            @click="addArrayValue"
                        >
                            {{ t('Add') }}
                        </button>
                    </div>

                    <div
                        v-if="arrayValues.length > 0"
                        class="flex flex-wrap gap-2"
                    >
                        <span
                            v-for="(value, index) in arrayValues"
                            :key="`${value}-${index}`"
                            class="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-sm"
                        >
                            {{ value }}
                            <button
                                type="button"
                                class="rounded-sm px-1 text-muted-foreground hover:bg-background hover:text-foreground"
                                :aria-label="`Remove ${value}`"
                                @click="removeArrayValue(index)"
                            >
                                ×
                            </button>
                            <input
                                type="hidden"
                                :name="`${field.name}[]`"
                                :value="value"
                            />
                        </span>
                    </div>
                </div>
            </template>
            <input
                v-if="!$slots.default && field.type === 'checkbox'"
                type="hidden"
                :name="field.name"
                :value="checkboxValue ? '1' : '0'"
            />
            <div
                v-if="!$slots.default && field.type === 'checkbox'"
                class="flex items-center gap-2"
            >
                <Checkbox
                    :id="idPrefix ? `${idPrefix}-${field.name}` : field.name"
                    v-model="checkboxValue"
                    :disabled="disabled"
                    :aria-invalid="error ? 'true' : undefined"
                    :aria-describedby="error ? errorId : undefined"
                />
                <button
                    v-if="hasClearableValue"
                    type="button"
                    class="inline-flex size-6 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    :aria-label="t('Clear :label', { label: field.label })"
                    @click="clearValue"
                >
                    <X class="size-3.5" />
                </button>
            </div>
            <input
                v-if="
                    !$slots.default &&
                    ['select', 'combobox', 'remote-select'].includes(
                        field.type,
                    ) &&
                    !field.multiple
                "
                type="hidden"
                :name="field.name"
                :value="selectValue ?? ''"
            />
            <template
                v-if="
                    !$slots.default &&
                    field.multiple &&
                    ['select', 'combobox'].includes(field.type)
                "
            >
                <input
                    v-for="value in multipleValues"
                    :key="value"
                    type="hidden"
                    :name="`${field.name}[]`"
                    :value="value"
                />
            </template>
            <MobileCrudPicker
                v-if="
                    !$slots.default &&
                    ['select', 'combobox'].includes(field.type) &&
                    !field.multiple
                "
                v-model="selectValue"
                :id="fieldId"
                :options="availableOptions"
                :placeholder="field.label"
                :disabled="disabled"
                :invalid="Boolean(error)"
                :searchable="field.type === 'combobox'"
            />
            <MobileCrudPicker
                v-if="
                    !$slots.default &&
                    ['select', 'combobox'].includes(field.type) &&
                    field.multiple
                "
                v-model="multipleValues"
                :id="fieldId"
                :options="availableOptions"
                :placeholder="field.label"
                :disabled="disabled"
                :invalid="Boolean(error)"
                :searchable="field.type === 'combobox'"
                multiple
            />
            <MobileCrudPicker
                v-if="!$slots.default && field.type === 'remote-select'"
                v-model="remoteSelectValue"
                :id="fieldId"
                :remote="field.remote!"
                :dependencies="dependencyValues"
                :placeholder="field.label"
                :disabled="disabled"
                :invalid="Boolean(error)"
            />
            <div
                v-if="
                    !$slots.default &&
                    field.type === 'select' &&
                    !field.multiple
                "
                class="relative max-sm:hidden"
            >
                <Select v-model="selectValue" :disabled="disabled">
                    <SelectTrigger
                        :id="
                            idPrefix ? `${idPrefix}-${field.name}` : field.name
                        "
                        class="w-full"
                        :aria-invalid="error ? 'true' : undefined"
                        :aria-describedby="error ? errorId : undefined"
                    >
                        <SelectValue :placeholder="field.label" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem
                            v-for="option in availableOptions"
                            :key="option.value"
                            :value="option.value"
                        >
                            {{ option.label }}
                        </SelectItem>
                    </SelectContent>
                </Select>
                <button
                    v-if="hasClearableValue"
                    type="button"
                    :class="selectClearButtonClass"
                    :aria-label="t('Clear :label', { label: field.label })"
                    @click="clearValue"
                >
                    <X class="size-3.5" />
                </button>
            </div>
            <div
                v-if="
                    !$slots.default && field.type === 'select' && field.multiple
                "
                class="relative max-sm:hidden"
            >
                <CrudSelectMultiple
                    v-model="multipleValues"
                    :id="fieldId"
                    :options="availableOptions"
                    :disabled="disabled"
                    :invalid="Boolean(error)"
                    :placeholder="field.label"
                />
                <button
                    v-if="hasClearableValue"
                    type="button"
                    :class="selectClearButtonClass"
                    :aria-label="t('Clear :label', { label: field.label })"
                    @click="clearValue"
                >
                    <X class="size-3.5" />
                </button>
            </div>
            <div
                v-if="
                    !$slots.default &&
                    field.type === 'combobox' &&
                    !field.multiple
                "
                class="relative max-sm:hidden"
            >
                <CrudCombobox
                    v-model="selectValue"
                    :id="fieldId"
                    :options="availableOptions"
                    :disabled="disabled"
                    :invalid="Boolean(error)"
                    :placeholder="field.label"
                />
                <button
                    v-if="hasClearableValue"
                    type="button"
                    :class="selectClearButtonClass"
                    :aria-label="t('Clear :label', { label: field.label })"
                    @click="clearValue"
                >
                    <X class="size-3.5" />
                </button>
            </div>
            <div
                v-if="
                    !$slots.default &&
                    field.type === 'combobox' &&
                    field.multiple
                "
                class="relative max-sm:hidden"
            >
                <CrudComboboxMultiple
                    v-model="multipleValues"
                    :id="fieldId"
                    :options="availableOptions"
                    :disabled="disabled"
                    :invalid="Boolean(error)"
                    :placeholder="field.label"
                />
                <button
                    v-if="hasClearableValue"
                    type="button"
                    :class="selectClearButtonClass"
                    :aria-label="t('Clear :label', { label: field.label })"
                    @click="clearValue"
                >
                    <X class="size-3.5" />
                </button>
            </div>
            <div
                v-if="!$slots.default && field.type === 'remote-select'"
                class="relative max-sm:hidden"
            >
                <RemoteCombobox
                    v-model="remoteSelectValue"
                    :id="fieldId"
                    :remote="field.remote!"
                    :placeholder="field.label"
                    :dependencies="dependencyValues"
                    :disabled="disabled"
                />
                <button
                    v-if="hasClearableValue"
                    type="button"
                    :class="selectClearButtonClass"
                    :aria-label="t('Clear :label', { label: field.label })"
                    @click="clearValue"
                >
                    <X class="size-3.5" />
                </button>
            </div>
            <div
                v-if="!$slots.default && field.type === 'textarea'"
                class="relative"
            >
                <Textarea
                    :id="idPrefix ? `${idPrefix}-${field.name}` : field.name"
                    :name="field.name"
                    :required="field.required"
                    :disabled="disabled"
                    :aria-invalid="error ? 'true' : undefined"
                    :aria-describedby="error ? errorId : undefined"
                    :class="hasClearableValue ? 'pr-9' : undefined"
                    v-model="textValue"
                />
                <button
                    v-if="hasClearableValue"
                    type="button"
                    :class="textareaClearButtonClass"
                    :aria-label="t('Clear :label', { label: field.label })"
                    @click="clearValue"
                >
                    <X class="size-3.5" />
                </button>
            </div>
            <Input
                v-if="!$slots.default && field.type === 'file'"
                :id="idPrefix ? `${idPrefix}-${field.name}` : field.name"
                :name="field.name"
                type="file"
                :required="field.required"
                :disabled="disabled"
                :aria-invalid="error ? 'true' : undefined"
                :aria-describedby="error ? errorId : undefined"
            />
            <div
                v-if="
                    !$slots.default &&
                    ![
                        'array',
                        'checkbox',
                        'select',
                        'combobox',
                        'remote-select',
                        'textarea',
                        'file',
                    ].includes(field.type)
                "
                class="relative"
            >
                <Input
                    :id="idPrefix ? `${idPrefix}-${field.name}` : field.name"
                    :name="field.name"
                    :type="htmlInputType(field.type)"
                    :step="field.step"
                    :required="field.required"
                    :disabled="disabled"
                    :autocomplete="
                        field.type === 'password' ? 'new-password' : undefined
                    "
                    :aria-invalid="error ? 'true' : undefined"
                    :aria-describedby="error ? errorId : undefined"
                    :class="inputClassForField(field)"
                    v-model="textValue"
                />
                <button
                    v-if="hasClearableValue"
                    type="button"
                    :class="clearButtonClassForField(field)"
                    :aria-label="t('Clear :label', { label: field.label })"
                    @click="clearValue"
                >
                    <X class="size-3.5" />
                </button>
            </div>
            <input
                v-if="!$slots.default && field.type === 'array' && arrayCleared"
                type="hidden"
                :name="`${field.name}__clear`"
                value="1"
            />
            <div :id="errorId" role="alert">
                <InputError :message="arrayInputError ?? error" />
            </div>
        </div>

        <div
            v-if="field.confirmed && !$slots.default && !readOnly"
            :class="['space-y-2', spanClasses(field.span)]"
        >
            <Label
                :for="
                    idPrefix
                        ? `${idPrefix}-${field.name}-confirmation`
                        : `${field.name}_confirmation`
                "
                :class="labelClass"
                >{{ t('Confirm :label', { label: field.label }) }}</Label
            >
            <Input
                :id="
                    idPrefix
                        ? `${idPrefix}-${field.name}-confirmation`
                        : `${field.name}_confirmation`
                "
                :name="`${field.name}_confirmation`"
                :type="htmlInputType(field.type)"
                :required="field.required"
                autocomplete="new-password"
                v-model="confirmationValue"
            />
        </div>
    </div>
</template>
