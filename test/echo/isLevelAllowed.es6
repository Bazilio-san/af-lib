'use strict';

// const config = require('config');
const { expect } = require('chai');
const echo = require('../../lib/echo.es6');


// const currentLevel = config.get('logger.level');
// const { defaultLevel } = echo;

function s (str) {
    return `${typeof str === 'string' ? `"${str}"` : `${str}`}`;
}

describe('echo.isLevelAllowed() should work properly', () => {
    describe('compare to current level', () => {
        const testArr = [
            ['error', true],
            ['warn', true],
            ['info', true],
            ['verbose', true],
            ['VERBOSE', true],
            ['debug', false],
            ['silly', false],
            ['SILLY', false],
            ['0', true],
            [1, true],
            ['2', true],
            [3, true],
            [4, false],
            ['4', false],
            ['', false],
            ['-2', false],
            [-2, false],
            [8, false],
            ['foo', false]
        ];
        testArr.forEach(([testLevel, bExprcted]) => {
            it(`${s(testLevel)}`, () => {
                const bResult = echo.isLevelAllowed(testLevel);
                expect(bResult).to.equal(bExprcted);
            });
        });
    });
    describe('compare to castom level', () => {
        const testArr = [
            ['error', 'warn', true],
            ['warn', 'error', false],
            ['info', 'VERBOSE', true],
            ['verbose', 'SILLY', true],
            ['verbose', 'foo', true],
            ['silly', 'foo', false],
            ['foo', 'silly', true],
            ['foo', 'info', true],
            ['foo', 'warn', false]
        ];
        testArr.forEach(([testLevel, compareLevel, bExprcted]) => {
            const bResult = echo.isLevelAllowed(testLevel, compareLevel);
            it(`${s(testLevel)} to ${s(compareLevel)} - ${bResult}`, () => {
                expect(bResult).to.equal(bExprcted);
            });
        });
    });
});
