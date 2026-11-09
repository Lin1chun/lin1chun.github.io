import assert from 'node:assert/strict';
import test from 'node:test';

import {
    countElapsedDays,
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
