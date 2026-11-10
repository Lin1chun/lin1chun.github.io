import assert from 'node:assert/strict';
import test from 'node:test';

import {
    countElapsedDays,
    getBirthdayCycle,
    updateDaysSinceBirth,
} from '../assets/js/days-since-birth.mjs';

const birthDate = '2007-07-15T00:00:00+08:00';

test('counts complete days elapsed since birth', () => {
    const cases = [
        ['2007-07-15T00:00:00+08:00', 0],
        ['2007-07-15T23:59:59.999+08:00', 0],
        ['2007-07-16T00:00:00+08:00', 1],
        ['2026-11-09T00:00:00+08:00', 7057],
    ];

    for (const [now, expected] of cases) {
        assert.equal(
            countElapsedDays(Date.parse(now), birthDate),
            expected,
            now,
        );
    }
});

test('does not count days before birth', () => {
    assert.equal(
        countElapsedDays(Date.parse('2007-07-14T23:59:59.999+08:00'), birthDate),
        0,
    );
});

test('writes the formatted elapsed-day count to its output', () => {
    const output = {
        dataset: { birthDate },
        textContent: '',
    };

    updateDaysSinceBirth(
        output,
        Date.parse('2026-11-09T00:00:00+08:00'),
    );

    assert.equal(output.textContent, '7,057');
});

test('reports progress through the current birthday cycle', () => {
    const cycle = getBirthdayCycle(
        Date.parse('2026-11-10T12:00:00+08:00'),
        birthDate,
    );

    assert.equal(cycle.daysSince, 118);
    assert.equal(cycle.daysUntil, 247);
    assert.equal(cycle.cycleDays, 365);
    assert.equal(cycle.progress, 118 / 365);
});

test('includes leap day in the birthday-cycle length', () => {
    const cycle = getBirthdayCycle(
        Date.parse('2028-02-01T09:30:00+08:00'),
        birthDate,
    );

    assert.equal(cycle.daysSince, 201);
    assert.equal(cycle.daysUntil, 165);
    assert.equal(cycle.cycleDays, 366);
    assert.equal(cycle.progress, 201 / 366);
});
