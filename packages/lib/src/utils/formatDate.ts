export const formatDate = function (date: number, timezone?: string, includeTimeDifference?: boolean): string {
    const dateObj = new Date(date);
    const options: Intl.DateTimeFormatOptions = {
        month: 'short',
        year: '2-digit',
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        // second: "2-digit",
        hour12: false
    }
    if (timezone) {
        options.timeZone = timezone;
    }
    return `${dateObj.toLocaleDateString(undefined, options)}${includeTimeDifference ? `[${timeDifference(date)}]` : ''}`;
}

export const timeDifference = function (date: number): string {
    const msPerMinute: number = 60 * 1000;
    const msPerHour: number = msPerMinute * 60;
    const msPerDay: number = msPerHour * 24;
    const msPerMonth: number = msPerDay * 30;
    const msPerYear: number = msPerDay * 365;

    let elapsed: number = new Date().getTime() - date;
    const isFuture = elapsed < 0;
    elapsed = Math.abs(elapsed);

    // Create RelativeTimeFormat with browser's default locale
    const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

    // Format based on elapsed time
    let value: number;
    let unit: Intl.RelativeTimeFormatUnit;

    if (elapsed < msPerMinute) {
        value = Math.round(elapsed / 1000);
        unit = 'second';
    } else if (elapsed < msPerHour) {
        value = Math.round(elapsed / msPerMinute);
        unit = 'minute';
    } else if (elapsed < msPerDay) {
        value = Math.round(elapsed / msPerHour);
        unit = 'hour';
    } else if (elapsed < msPerMonth) {
        value = Math.round(elapsed / msPerDay);
        unit = 'day';
    } else if (elapsed < msPerYear) {
        value = Math.round(elapsed / msPerMonth);
        unit = 'month';
    } else {
        value = Math.round(elapsed / msPerYear);
        unit = 'year';
    }

    // Negate value for past dates
    return rtf.format(isFuture ? value : -value, unit);
}