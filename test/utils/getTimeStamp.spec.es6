'use strict';

const { expect } = require('chai');
const U = require('../../lib/utils.es6');

describe('utils.getTimeStamp() should work properly', () => {
    it('without any options', () => {
        const val = U.getTimeStamp();
        expect(val).to.match(/\d{6}-\d{4}/);
    });

    it('with option "seconds"', () => {
        const val = U.getTimeStamp({ seconds: true });
        expect(val).to.match(/\d{6}-\d{4}\.\d{2}/);
    });
    it('with option "seconds & milliseconds"', () => {
        const val = U.getTimeStamp({ seconds: true, milliseconds: true });
        expect(val).to.match(/\d{6}-\d{4}\.\d{2}\.\d{3}/);
    });
});
