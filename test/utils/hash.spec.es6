'use strict';

const { expect } = require('chai');
const U = require('../../lib/utils.es6');

describe('utils.hash() should work properly', () => {
    it('md5 hash should be valid', () => {
        const hash = U.hash('123567890QWERTYUIOPASDFGHJKLZXCVBNM');
        expect(hash).to.equal('9778739a73782b45d0ca1ce86d85cd5f');
        expect(hash.length).to.equal(32);
    });
    it('different string should give different hash', () => {
        const hash1 = U.hash('123567890QWERTYUIOPASDFGHJKLZXCVBNM');
        const hash2 = U.hash('223567890QWERTYUIOPASDFGHJKLZXCVBNM');
        expect(hash1).to.not.equal(hash2);
    });
});
