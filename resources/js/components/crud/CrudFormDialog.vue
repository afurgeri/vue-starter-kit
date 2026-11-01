<script setup lang="ts">
import { computed, ref, useSlots } from 'vue';
import CrudForm from '@/components/crud/CrudForm.vue';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTranslation } from '@/composables/useTranslation';
import type { CrudField, FormAction } from '@/types/crud';

const props = withDefaults(
    defineProps<{
        action: FormAction;
        fields: CrudField[];
        triggerLabel: string;
        title: string;
        submitLabel: string;
        description?: string;
        initialValues?: Record<string, unknown>;
        resetOnSuccess?: boolean;
        fieldIdPrefix?: string;
        triggerTooltip?: string;
    }>(),
    {
        description: undefined,
        initialValues: () => ({}),
        resetOnSuccess: false,
        fieldIdPrefix: undefined,
        triggerTooltip: undefined,
    },
);

const { t } = useTranslation();
const open = ref(false);
const formRef = ref<InstanceType<typeof CrudForm> | null>(null);
const slots = useSlots();

// Forms laid out in several columns need more room than the default dialog.
const isMultiColumn = computed(() =>
    props.fields.some(
        (field) => field.visible && (field.span.md ?? field.span.base) < 12,
    ),
);

function setOpen(value: boolean): void {
    if (
        !value &&
        formRef.value?.isDirty &&
        !window.confirm(
            t('You have unsaved changes. Do you want to leave without saving?'),
        )
    ) {
        return;
    }

    open.value = value;
}

function hasFieldSlot(fieldName: string): boolean {
    return Boolean(slots[`field-${fieldName}`]);
}
</script>

<template>
    <Dialog :open="open" @update:open="setOpen">
        <Tooltip v-if="triggerTooltip" :ignore-non-keyboard-focus="true">
            <TooltipTrigger as-child>
                <DialogTrigger as-child>
                    <slot name="trigger">
                        <Button type="button">{{ triggerLabel }}</Button>
                    </slot>
                </DialogTrigger>
            </TooltipTrigger>
            <TooltipContent>{{ triggerTooltip }}</TooltipContent>
        </Tooltip>

        <DialogTrigger v-else as-child>
            <slot name="trigger">
                <Button type="button">{{ triggerLabel }}</Button>
            </slot>
        </DialogTrigger>

        <DialogContent
            :class="[
                'max-h-[calc(100dvh-2rem)] overflow-y-auto',
                isMultiColumn ? 'sm:max-w-2xl' : 'sm:max-w-lg',
            ]"
        >
            <DialogHeader class="text-left">
                <DialogTitle>{{ title }}</DialogTitle>
                <DialogDescription v-if="description">
                    {{ description }}
                </DialogDescription>
            </DialogHeader>

            <CrudForm
                ref="formRef"
                :action="action"
                :fields="fields"
                :initial-values="initialValues"
                :submit-label="submitLabel"
                :reset-on-success="resetOnSuccess"
                :field-id-prefix="fieldIdPrefix"
                form-class="grid grid-cols-12 gap-4 px-1 pb-6"
                cancelable
                @success="open = false"
                @cancel="setOpen(false)"
            >
                <template
                    v-for="field in fields.filter((field) =>
                        hasFieldSlot(field.name),
                    )"
                    :key="field.name"
                    #[`field-${field.name}`]="slotProps"
                >
                    <slot :name="`field-${field.name}`" v-bind="slotProps" />
                </template>
                <template #fields="slotProps">
                    <slot name="fields" v-bind="slotProps" />
                </template>
            </CrudForm>
        </DialogContent>
    </Dialog>
</template>
