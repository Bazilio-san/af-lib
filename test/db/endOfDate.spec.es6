'use strict';

const { expect } = require('chai');
const { sql } = require('../../lib/db.es6');

describe('sql.endOfDate() should work properly', () => {
    const testArr = [
        ['2000-01-22T11:59:00', 0, '2000-01-22T23:59:59.999'],
        ['2000-01-22T11:10:11.12', 0, '2000-01-22T23:59:59.999'],
        ['2000-01-22', 0, '2000-01-22T23:59:59.999'],
        ['2000-01-22 11:59', 0, '2000-01-22T23:59:59.999'],
        ['2000-01-22 11:59:00', 0, '2000-01-22T23:59:59.999'],
        ['2000-01-22 11:10:11.12', 0, '2000-01-22T23:59:59.999'],
        ['2019-8-9 5:16:14 AM', 0, '2019-08-09T23:59:59.999'],
        ['2019-8-9 5:16:14 PM', 0, '2019-08-09T23:59:59.999'],

        ['2000-01-22T11:59:00', 1, `'2000-01-22T23:59:59.999'`],
        ['2000-01-22T11:10:11.12', 1, `'2000-01-22T23:59:59.999'`],
        ['2000-01-22', 1, `'2000-01-22T23:59:59.999'`],
        ['2000-01-22 11:59', 1, `'2000-01-22T23:59:59.999'`],
        ['2000-01-22 11:59:00', 1, `'2000-01-22T23:59:59.999'`],
        ['2000-01-22 11:10:11.12', 1, `'2000-01-22T23:59:59.999'`],
        ['2019-8-9 5:16:14 AM', 1, `'2019-08-09T23:59:59.999'`],
        ['2019-8-9 5:16:14 PM', 1, `'2019-08-09T23:59:59.999'`]
    ];
    testArr.forEach((pair) => {
        it(`${pair[0].toString()} ${pair[1] ? '[quotes]' : ''} -> ${pair[2]}`, () => {
            const result = sql.endOfDate(pair[0], pair[1]);
            expect(result).to.equal(pair[2]);
        });
    });
});
