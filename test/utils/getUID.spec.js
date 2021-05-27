const { expect } = require('chai');
const moment = require('moment-timezone');
const U = require('af-fns');

describe('utils.getUID() should work properly', () => {
    it('valid uid', () => {
        const uid = U.getUID({
            d: { a: 5, b: 6 },
            dd: (new Date()),
            moment: moment(new Date()),
            fn: () => {
                const a = 1;
                return a;
            },
            fn2 () {
                const a = 2;
                return a;
            },
            fn3: function rrr () {
                const a = 3;
                return a;
            },
            a: 1,
            b: 'foo',
            c: [1, 2, 3]
        });
        expect(uid).to.match(/^[A-F\d]{8}(-[A-F\d]{4}){4}[A-F\d]{8}/i);
    });
    it('different data types should give different uid', () => {
        const uid = U.getUID({ a: '1', b: 'foo' });
        const uid2 = U.getUID({ a: 1, b: 'foo' });
        expect(uid).to.not.equal(uid2);
    });
    it('uid should be independent of array elements sequence or object propertyes', () => {
        const uid = U.getUID({ c: [1, 2, 3], d: { a: 5, b: 6 } });
        const uid2 = U.getUID({ c: [2, 1, 3], d: { b: 6, a: 5, } });
        expect(uid).to.eql(uid2);
    });
});
