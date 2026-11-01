<script setup lang="ts">
import { Form } from '@inertiajs/vue3';
import { Trash2 } from '@lucide/vue';
import { ref } from 'vue';
import type { Component } from 'vue';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
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
import type { FormAction } from '@/types/crud';

withDefaults(
    defineProps<{
        action: FormAction;
        triggerLabel: string;
        title: string;
        description?: string;
        confirmLabel?: string;
        cancelLabel?: string;
        icon?: Component;
    }>(),
    {
        description: undefined,
        confirmLabel: undefined,
        cancelLabel: undefined,
        icon: () => Trash2,
    },
);

const open = ref(false);
const formRef = ref<{ clearErrors: () => void } | null>(null);
const { t } = useTranslation();

function handleOpenChange(value: boolean): void {
    open.value = value;

    if (!value) {
        formRef.value?.clearErrors();
    }
}
</script>

<template>
    <Dialog :open="open" @update:open="handleOpenChange">
        <Tooltip :ignore-non-keyboard-focus="true">
            <TooltipTrigger as-child>
                <DialogTrigger as-child>
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon-sm"
                        :aria-label="triggerLabel"
                    >
                        <component :is="icon" class="size-4" />
                    </Button>
                </DialogTrigger>
            </TooltipTrigger>
            <TooltipContent>{{ triggerLabel }}</TooltipContent>
        </Tooltip>

        <DialogContent>
            <Form
                ref="formRef"
                v-bind="action"
                @success="open = false"
                v-slot="{ processing, errors, hasErrors }"
            >
                <DialogHeader class="space-y-3">
                    <DialogTitle>{{ title }}</DialogTitle>
                    <DialogDescription v-if="description">
                        {{ description }}
                    </DialogDescription>
                </DialogHeader>

                <p
                    v-if="hasErrors"
                    role="alert"
                    class="mt-4 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
                >
                    {{ Object.values(errors).join(' ') }}
                </p>

                <DialogFooter class="mt-6 gap-2">
                    <DialogClose as-child>
                        <Button type="button" variant="secondary">
                            {{ cancelLabel ?? t('Cancel') }}
                        </Button>
                    </DialogClose>

                    <Button
                        type="submit"
                        variant="destructive"
                        :disabled="processing"
                    >
                        {{ confirmLabel ?? triggerLabel }}
                    </Button>
                </DialogFooter>
            </Form>
        </DialogContent>
    </Dialog>
</template>
