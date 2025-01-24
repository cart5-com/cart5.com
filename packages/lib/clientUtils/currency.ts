function getSupportedCurrencies() {
    function $(amount: number, currency: string) {
        let locale = 'en-US';
        return Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            currencyDisplay: "name",
        }).format(amount);
    }
    let currencies: { code: string, name: string }[] = [];
    const supportedCurrencies = Intl.supportedValuesOf('currency');
    const rx = /(?<= ).+/;
    supportedCurrencies.forEach((cur) => {
        let output = $(0, cur).trim();
        let obj = {
            code: cur,
            name: output.match(rx)?.[0] || ''
        };
        currencies.push(obj);
    });
    return currencies;
}
// console.log(getSupportedCurrencies());

