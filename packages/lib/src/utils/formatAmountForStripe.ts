// List of zero-decimal currencies according to Stripe docs
const ZERO_DECIMAL_CURRENCIES = [
    'bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw',
    'mga', 'pyg', 'rwf', 'ugx', 'vnd', 'vuv',
    'xaf', 'xof', 'xpf'
];

// List of special case currencies that should be treated as zero-decimal
const SPECIAL_ZERO_DECIMAL_CURRENCIES = [
    'isk', // Icelandic Króna - technically has 2 decimals but used as zero-decimal
    // Note: HUF and TWD are special cases for payouts but use 2 decimals for charges
];

// Format the amount for Stripe based on currency
export function formatAmountForStripe(amount: number, currency: string): number {
    const lowerCaseCurrency = currency.toLowerCase();

    if (ZERO_DECIMAL_CURRENCIES.includes(lowerCaseCurrency) ||
        SPECIAL_ZERO_DECIMAL_CURRENCIES.includes(lowerCaseCurrency)) {
        return Math.round(amount);
    }
    return Math.round(amount * 100);
}