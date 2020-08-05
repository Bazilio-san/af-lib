'use strict';

const { expect } = require('chai');
const echo = require('../../lib/echo.es6');


describe('echo.getILevel() should work properly', () => {
    describe('should properly recognize string levels', () => {
        const testArr = [['error', 0], ['warn', 1], ['info', 2], ['verbose', 3], ['debug', 4], ['silly', 5],
            ['SILLY', 5]];
        testArr.forEach(([strLevel, iLevelExprcted]) => {
            it(`'${strLevel}'`, () => {
                const iLevel = echo.getILevel(strLevel);
                expect(iLevel).to.equal(iLevelExprcted);
            });
        });
    });
    describe('should properly recognize numbered as sting levels', () => {
        for (let i = 0; i < 6; i++) {
            const testValue = String(i);
            it(`'${testValue}'`, () => {
                const iLevel = echo.getILevel(testValue);
                expect(iLevel).to.equal(i);
            });
            it(`'[${testValue}]'`, () => {
                const iLevel = echo.getILevel([testValue]);
                expect(iLevel).to.equal(i);
            });
        }
    });
    describe('should properly recognize numbered levels', () => {
        for (let i = 0; i < 6; i++) {
            it(`${i}`, () => {
                const iLevel = echo.getILevel(i);
                expect(iLevel).to.equal(i);
            });
            it(`[${i}]`, () => {
                const iLevel = echo.getILevel([i]);
                expect(iLevel).to.equal(i);
            });
        }
    });
    describe('should return default value if not recognized and noDefault = false', () => {
        const testArr = [[''], [], [1, 2, 3], 'error2', '', null, undefined, false, true, 7, { s: 1 }];
        const { defaultILevel } = echo;
        testArr.forEach((testValue) => {
            it(`'${testValue}'`, () => {
                const iLevel = echo.getILevel(testValue);
                expect(iLevel).to.equal(defaultILevel);
            });
        });
    });
    describe('should return -1 value if test level < 0', () => {
        const testArr = [-1, -10];
        testArr.forEach((testValue) => {
            it(`'${testValue}'`, () => {
                const iLevel = echo.getILevel(testValue);
                expect(iLevel).to.equal(-1);
            });
        });
    });
    describe('should return "undefined" if not recognized and noDefault = true', () => {
        const testArr = [[''], [], [1, 2, 3], 'error2', '', null, undefined, false, true, 7, { s: 1 }];
        testArr.forEach((testValue) => {
            it(`'${testValue}'`, () => {
                const iLevel = echo.getILevel(testValue, true);
                expect(iLevel).to.equal(undefined);
            });
        });
    });
});
