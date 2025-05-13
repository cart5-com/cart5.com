export const formatCurrency = (
    amount: number | string | null | undefined,
    currency: string | null | undefined = undefined,
    locale: string | undefined = undefined,
    options: Intl.NumberFormatOptions = {}
) => {
    if (amount === null || amount === undefined) {
        return '';
    }

    // Convert string to number if needed
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    // Handle NaN case
    if (isNaN(numericAmount)) {
        return '';
    }

    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency ?? 'GBP',
            ...options
        }).format(numericAmount);
    } catch (error) {
        // Fallback in case of errors (invalid locale or currency)
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP'
        }).format(numericAmount);
    }
};
