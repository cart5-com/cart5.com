export const formatDate = function (date: number): string {
    const dateObj = new Date(date);
    const options: Intl.DateTimeFormatOptions = {
        month: 'short',
        year: '2-digit',
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    }
    return `${dateObj.toLocaleDateString(undefined, options)}[${timeDifference(date)}]`;
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

    const getTimeString = (value: number, unit: string) => `${Math.round(value)} ${unit}${isFuture ? ' from now' : ' ago'}`;

    if (elapsed < msPerMinute) {
        return getTimeString(elapsed / 1000, 'sec.');
    } else if (elapsed < msPerHour) {
        return getTimeString(elapsed / msPerMinute, 'min.');
    } else if (elapsed < msPerDay) {
        return getTimeString(elapsed / msPerHour, 'hours');
    } else if (elapsed < msPerMonth) {
        return getTimeString(elapsed / msPerDay, 'days');
    } else if (elapsed < msPerYear) {
        return getTimeString(elapsed / msPerMonth, 'months');
    } else {
        return getTimeString(elapsed / msPerYear, 'years');
    }
}