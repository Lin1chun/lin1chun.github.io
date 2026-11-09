const DAY_MS = 86_400_000;
const numberFormat = new Intl.NumberFormat("en-US");

export const countElapsedDays = (now, birthDate) => {
    const birthTime = Date.parse(birthDate);
    const currentTime = typeof now === "number" ? now : now.getTime();
    return Math.max(0, Math.floor((currentTime - birthTime) / DAY_MS));
};

export const updateDaysSinceBirth = (output, now = Date.now()) => {
    const days = countElapsedDays(now, output.dataset.birthDate);
    const formatted = numberFormat.format(days);
    if (output.textContent !== formatted) {
        output.textContent = formatted;
    }
    return days;
};

const refreshDaysSinceBirth = (documentRoot = document, now = Date.now()) => {
    documentRoot
        .querySelectorAll("[data-days-since-birth]")
        .forEach((output) => updateDaysSinceBirth(output, now));
};

if (typeof document !== "undefined") {
    const refresh = () => refreshDaysSinceBirth(document);
    refresh();
    window.setInterval(refresh, 60_000);
}
