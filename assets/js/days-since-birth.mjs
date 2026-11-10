const DAY_MS = 86_400_000;
const BIRTHDAY_OFFSET_MS = 8 * 60 * 60 * 1000;
const numberFormat = new Intl.NumberFormat("en-US");

export const countElapsedDays = (now, birthDate) => {
    const birthTime = Date.parse(birthDate);
    const currentTime = typeof now === "number" ? now : now.getTime();
    return Math.max(0, Math.floor((currentTime - birthTime) / DAY_MS));
};

const birthdayInYear = (year, month, day) =>
    Date.UTC(year, month, day) - BIRTHDAY_OFFSET_MS;

export const getBirthdayCycle = (now, birthDate) => {
    const birthTime = Date.parse(birthDate);
    const currentTime = typeof now === "number" ? now : now.getTime();
    const birthDateInZone = new Date(birthTime + BIRTHDAY_OFFSET_MS);
    const currentDateInZone = new Date(currentTime + BIRTHDAY_OFFSET_MS);
    const month = birthDateInZone.getUTCMonth();
    const day = birthDateInZone.getUTCDate();
    const year = currentDateInZone.getUTCFullYear();
    const birthdayThisYear = birthdayInYear(year, month, day);
    const birthdayLastYear = birthdayInYear(year - 1, month, day);
    const birthdayNextYear = birthdayInYear(year + 1, month, day);
    const isBeforeBirthday = currentTime < birthdayThisYear;
    const previousBirthday = isBeforeBirthday
        ? birthdayLastYear
        : birthdayThisYear;
    const nextBirthday = isBeforeBirthday
        ? birthdayThisYear
        : birthdayNextYear;
    const currentDayStart =
        Math.floor((currentTime + BIRTHDAY_OFFSET_MS) / DAY_MS) * DAY_MS -
        BIRTHDAY_OFFSET_MS;
    const daysSince = Math.floor((currentDayStart - previousBirthday) / DAY_MS);
    const daysUntil = Math.floor((nextBirthday - currentDayStart) / DAY_MS);
    const cycleDays = Math.floor((nextBirthday - previousBirthday) / DAY_MS);

    return {
        daysSince,
        daysUntil,
        cycleDays,
        progress: daysSince / cycleDays,
    };
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
        .forEach((output) => {
            updateDaysSinceBirth(output, now);
            const counter = output.closest("[data-birthday-counter]");
            const remaining = counter?.querySelector("[data-birthday-remaining]");
            const cycle = getBirthdayCycle(now, output.dataset.birthDate);

            counter?.style.setProperty(
                "--birthday-progress",
                cycle.progress.toFixed(6),
            );
            if (remaining) {
                const unit = cycle.daysUntil === 1 ? "day" : "days";
                remaining.textContent = `${numberFormat.format(cycle.daysUntil)} ${unit}`;
            }
        });
};

if (typeof document !== "undefined") {
    const refresh = () => refreshDaysSinceBirth(document);
    refresh();
    window.setInterval(refresh, 60_000);
}
