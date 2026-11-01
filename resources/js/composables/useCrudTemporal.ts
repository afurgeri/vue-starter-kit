import type { CrudTemporalType } from '@/types/crud';

function parseDateTime(value: string): Date | undefined {
    const normalized = value.trim().replace(' ', 'T');
    const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(normalized);
    const date = new Date(hasTimezone ? normalized : `${normalized}Z`);

    return Number.isNaN(date.getTime()) ? undefined : date;
}

function dateTimeParts(
    value: string,
    timezone: string,
): Record<string, string> | undefined {
    const date = parseDateTime(value);

    if (!date) {
        return undefined;
    }

    return Object.fromEntries(
        new Intl.DateTimeFormat('en-CA', {
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hourCycle: 'h23',
        })
            .formatToParts(date)
            .map(({ type, value: partValue }) => [type, partValue]),
    );
}

export function formatCrudDateTimeLocal(
    value: string,
    timezone: string,
): string {
    const parts = dateTimeParts(value, timezone);

    if (!parts) {
        return value.slice(0, 16);
    }

    return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export function formatCrudTemporalValue(
    value: unknown,
    type: CrudTemporalType | undefined,
    timezone: string | undefined,
): unknown {
    if (typeof value !== 'string' || !type) {
        return value;
    }

    if (type === 'date') {
        return value.slice(0, 10);
    }

    if (type === 'time') {
        return value.slice(0, 5);
    }

    const date = parseDateTime(value);

    if (!date) {
        return value;
    }

    return new Intl.DateTimeFormat(undefined, {
        timeZone: timezone,
        dateStyle: 'short',
        timeStyle: 'short',
    }).format(date);
}
