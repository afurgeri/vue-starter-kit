type DateInput = Date | string | null | undefined;
type DateFormat = string | Intl.DateTimeFormatOptions;

function formatDateMask(date: Date, mask: string): string {
    const values: Record<string, string> = {
        YYYY: String(date.getFullYear()).padStart(4, '0'),
        yyyy: String(date.getFullYear()).padStart(4, '0'),
        MM: String(date.getMonth() + 1).padStart(2, '0'),
        DD: String(date.getDate()).padStart(2, '0'),
        dd: String(date.getDate()).padStart(2, '0'),
        HH: String(date.getHours()).padStart(2, '0'),
        mm: String(date.getMinutes()).padStart(2, '0'),
        ss: String(date.getSeconds()).padStart(2, '0'),
    };

    return mask.replace(
        /YYYY|yyyy|MM|DD|dd|HH|mm|ss/g,
        (token) => values[token],
    );
}

function parseUtcDate(value: DateInput): Date | undefined {
    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? undefined : value;
    }

    if (!value) {
        return undefined;
    }

    const input = value.trim();
    const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input);

    if (dateOnlyMatch) {
        const [, year, month, day] = dateOnlyMatch;
        const date = new Date(Number(year), Number(month) - 1, Number(day));

        return Number.isNaN(date.getTime()) ? undefined : date;
    }

    const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(input);
    const date = new Date(hasTimezone ? input : `${input}Z`);

    return Number.isNaN(date.getTime()) ? undefined : date;
}

export function formatLocalDate(
    value?: DateInput,
    format?: DateFormat,
): string {
    const date = parseUtcDate(value);

    if (!date) {
        return '';
    }

    return typeof format === 'string'
        ? formatDateMask(date, format)
        : new Intl.DateTimeFormat(
              undefined,
              format ?? { dateStyle: 'short' },
          ).format(date);
}

export function formatLocalDateTime(
    value?: DateInput,
    format?: DateFormat,
): string {
    const date = parseUtcDate(value);

    if (!date) {
        return '';
    }

    return typeof format === 'string'
        ? formatDateMask(date, format)
        : new Intl.DateTimeFormat(
              undefined,
              format ?? { dateStyle: 'short', timeStyle: 'short' },
          ).format(date);
}

export function useLocalTime(): {
    formatLocalDate: typeof formatLocalDate;
    formatLocalDateTime: typeof formatLocalDateTime;
} {
    return { formatLocalDate, formatLocalDateTime };
}
