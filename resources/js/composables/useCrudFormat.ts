import { formatCrudTemporalValue } from '@/composables/useCrudTemporal';
import type { CrudBadgeVariant, CrudColumn, CrudRecord } from '@/types/crud';

const dateOnlyPattern = /^(\d{4})-(\d{2})-(\d{2})$/;

function toNumber(value: unknown): number | undefined {
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : undefined;
    }

    if (typeof value !== 'string' || value.trim() === '') {
        return undefined;
    }

    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : undefined;
}

/**
 * Formats an amount with the given locale, e.g. "$ 10.000,00" for es-AR and ARS.
 * Without a currency, only the number is formatted with two decimals.
 */
export function formatCrudMoney(
    value: unknown,
    currency?: string | null,
    locale?: string,
): string {
    const amount = toNumber(value);

    if (amount === undefined) {
        return typeof value === 'string' ? value : '';
    }

    try {
        return new Intl.NumberFormat(
            locale,
            currency
                ? {
                      style: 'currency',
                      currency,
                      currencyDisplay: 'symbol',
                  }
                : { minimumFractionDigits: 2, maximumFractionDigits: 2 },
        ).format(amount);
    } catch {
        return new Intl.NumberFormat(locale, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    }
}

/**
 * Formats a calendar date (YYYY-MM-DD or an ISO date-time) as a day, e.g. "05/10/2026" for es-AR.
 */
export function formatCrudDate(
    value: unknown,
    locale?: string,
    timezone?: string,
): string {
    if (typeof value !== 'string' || value === '') {
        return '';
    }

    const dateOnly = dateOnlyPattern.exec(value.slice(0, 10));
    const isDateOnly = value.length === 10 && dateOnly !== null;
    const date = isDateOnly
        ? new Date(
              Date.UTC(
                  Number(dateOnly[1]),
                  Number(dateOnly[2]) - 1,
                  Number(dateOnly[3]),
              ),
          )
        : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: isDateOnly ? 'UTC' : timezone,
    }).format(date);
}

export function formatCrudDateTime(
    value: unknown,
    locale?: string,
    timezone?: string,
): string {
    if (typeof value !== 'string' || value === '') {
        return '';
    }

    const normalized = value.trim().replace(' ', 'T');
    const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(normalized);
    const date = new Date(hasTimezone ? normalized : `${normalized}Z`);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
        timeZone: timezone,
    }).format(date);
}

export function crudColumnLabel(column: CrudColumn, value: unknown): unknown {
    if (
        column.labels &&
        (typeof value === 'string' || typeof value === 'number')
    ) {
        return column.labels[String(value)] ?? value;
    }

    return value;
}

export function crudBadgeVariant(
    column: CrudColumn,
    value: unknown,
): CrudBadgeVariant {
    if (Array.isArray(column.badges) || !column.badges) {
        return 'neutral';
    }

    return column.badges[String(value)] ?? 'neutral';
}

export const crudBadgeClasses: Record<CrudBadgeVariant, string> = {
    neutral: 'bg-muted text-muted-foreground',
    info: 'bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300',
    success:
        'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
    warning:
        'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
    danger: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300',
};

export function formatCrudColumnValue(
    column: CrudColumn,
    record: CrudRecord,
): unknown {
    const value = record[column.name];

    if (column.type === 'money') {
        const currency =
            column.currency ??
            (column.currency_column
                ? String(record[column.currency_column] ?? '')
                : undefined);

        return formatCrudMoney(value, currency || undefined, column.locale);
    }

    if (column.type === 'date' && column.locale) {
        return formatCrudDate(value, column.locale, column.timezone);
    }

    if (column.type === 'datetime' && column.locale) {
        return formatCrudDateTime(value, column.locale, column.timezone);
    }

    if (column.type) {
        return formatCrudTemporalValue(value, column.type, column.timezone);
    }

    return crudColumnLabel(column, value);
}
