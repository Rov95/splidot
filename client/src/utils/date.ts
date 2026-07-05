const dateFormatter = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
});

// Returns '' for missing/unparseable values so callers can skip rendering.
export const formatDate = (value: string | null | undefined): string => {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : dateFormatter.format(date);
};
