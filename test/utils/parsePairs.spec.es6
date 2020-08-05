'use strict';

const { expect } = require('chai');
const U = require('../../lib/utils.es6');

describe('utils.parsePairs() should work properly', () => {
    it('without any params', () => {
        const res = U.parsePairs('p1=1&p2=2');
        const test = { p1: '1', p2: '2' };
        expect(res).to.eql(test);
    });

    it('with delimiters specified', () => {
        const res = U.parsePairs('p1:1|p2:2', '|', ':');
        const test = { p1: '1', p2: '2' };
        expect(res).to.eql(test);
    });
});
