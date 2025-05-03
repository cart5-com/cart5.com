// TODO: remove this file
// use Intl.NumberFormat instead
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat

export function roundTo2Decimals(amount: number) {
    return Math.round(amount * 100) / 100;
}