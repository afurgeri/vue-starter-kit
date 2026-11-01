import type { Method } from '@inertiajs/core';
import type { Component } from 'vue';

export type CrudHref =
    | string
    | {
          url: string;
          method: 'get';
      };

export type CrudLayoutWidth = 'standard' | 'wide' | 'full';

export type CrudTemporalType = 'date' | 'time' | 'datetime';

export type CrudBadgeVariant =
    'neutral' | 'info' | 'success' | 'warning' | 'danger';

export type CrudSpan = {
    base: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
};

export type CrudColumn = {
    name: string;
    label: string;
    sortable: boolean;
    mobile?: boolean;
    width?: string;
    min_width?: string;
    max_width?: string;
    fixed?: boolean;
    type?: CrudTemporalType | 'money';
    timezone?: string;
    locale?: string;
    currency?: string;
    currency_column?: string;
    labels?: Record<string, string>;
    badges?: Record<string, CrudBadgeVariant> | [];
};

export type CrudField = {
    name: string;
    label: string;
    type:
        | 'text'
        | 'email'
        | 'password'
        | 'checkbox'
        | 'select'
        | 'combobox'
        | 'remote-select'
        | 'number'
        | CrudTemporalType
        | 'textarea'
        | 'file'
        | 'array';
    confirmed: boolean;
    required: boolean;
    rules: string[];
    clearable: boolean;
    multiple?: boolean;
    step?: string;
    unique_items?: boolean;
    visible: boolean;
    visible_on_update: boolean;
    span: {
        base: number;
        sm?: number;
        md?: number;
        lg?: number;
        xl?: number;
        '2xl'?: number;
    };
    defaultValue?: unknown;
    timezone?: string;
    options?: CrudOption[];
    depends_on?: string[];
    remote?: CrudRemoteFilter;
};

export type CrudFieldSlotProps = {
    field: CrudField;
    id: string;
    name: string;
    defaultValue: unknown;
    error?: string;
    required: boolean;
    readOnly: boolean;
    value: unknown;
    values: Readonly<Record<string, unknown>>;
    dependencies: Readonly<Record<string, unknown>>;
    options: CrudOption[];
    disabled: boolean;
    setValue: (value: unknown) => void;
    clear: () => void;
};

export type CrudSort = {
    column: string | null;
    direction: 'asc' | 'desc';
} | null;

export type CrudSearch = {
    enabled: boolean;
    value: string | null;
    span: CrudSpan;
    fields?: string[];
};

export type CrudOption = {
    value: string;
    label: string;
    [key: string]: unknown;
};

export type CrudFilterOption = {
    value: string;
    label: string;
};

export type CrudFilterValue = string | string[];

export type CrudRemoteFilter = {
    url: string;
    min_chars: number;
    debounce: number;
    source?: 'filter' | 'field';
};

export type CrudFilter = {
    name: string;
    label: string;
    type:
        | 'text'
        | CrudTemporalType
        | 'number'
        | 'select'
        | 'combobox'
        | 'remote-select';
    operator: string;
    relation: boolean;
    clearable: boolean;
    multiple?: boolean;
    range: string | null;
    value: unknown;
    span: CrudSpan;
    step?: string;
    options?: CrudFilterOption[];
    remote?: CrudRemoteFilter;
    max_date?: string | null;
    timezone?: string;
};

export type CrudSchema = {
    resource: string;
    form_mode: 'dialog' | 'page';
    page_width: CrudLayoutWidth;
    form_width: CrudLayoutWidth;
    filters_open: boolean;
    operations: {
        show: boolean;
        create: boolean;
        update: boolean;
        delete: boolean;
        export?: boolean;
    };
    export_url: string | null;
    title: string;
    description: string | null;
    empty_label: string | null;
    columns: CrudColumn[];
    fields: CrudField[];
    sort: CrudSort;
    search: CrudSearch;
    filters: CrudFilter[];
};

export type CrudPaginator<T> = {
    data: T[];
    current_page: number;
    per_page: number;
    last_page?: number;
    total?: number;
    from: number | null;
    to: number | null;
    prev_page_url: string | null;
    next_page_url: string | null;
    has_more_pages?: boolean;
};

export type CrudRecord = Record<string, unknown> & {
    id: string | number;
};

export type FormAction = {
    action: string;
    method: Method;
};

export type CrudCreateConfig = {
    can: boolean;
    action: FormAction;
    href?: CrudHref;
    label?: string;
    title?: string;
    description?: string;
    submitLabel?: string;
};

export type CrudOperationIcon = Component;

export type CrudEditConfig<T extends CrudRecord> = {
    action: (record: T) => FormAction;
    href?: (record: T) => CrudHref;
    can?: (record: T) => boolean;
    label?: string;
    title?: (record: T) => string;
    description?: string;
    submitLabel?: string;
    icon?: CrudOperationIcon;
};

export type CrudShowConfig<T extends CrudRecord> = {
    href: (record: T) => CrudHref;
    can?: (record: T) => boolean;
    label?: string;
    title?: (record: T) => string;
    icon?: CrudOperationIcon;
};

export type CrudDestroyConfig<T extends CrudRecord> = {
    action: (record: T) => FormAction;
    can?: (record: T) => boolean;
    label?: string;
    title?: (record: T) => string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    icon?: CrudOperationIcon;
};
