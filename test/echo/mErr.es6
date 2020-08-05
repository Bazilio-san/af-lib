'use strict';

/* eslint-disable no-console */
process.env.NODE_ENV = 'testing';

const echo = require('../../lib/echo.es6');
const { db } = require('../../lib/db.es6');

function a () {
    const o = {};
    const errorHere = o.notExist.prop;
    return `${errorHere}`;
}

function b () {
    const ret = a();
    return `${ret}`;
}

function test1 () {
    try {
        const x = 1;
        const y = b();
        return x + y;
    } catch (err) {
        echo.mErr(err, { lb: 2, msg: 'TEST #1: === Должны быть правильные ссылки на вызовы ===' });
    }
}


// ############################################################

function prom () {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const x = 1;
            if (x !== 1) {
                resolve('OK');
            } else {
                // eslint-disable-next-line prefer-promise-reject-errors
                reject('FAILURE');
            }
        }, 10);
    });
}

async function test2 () {
    let x = 1;
    try {
        // line
        await prom();
        // line
        // line
        x = 2;
        // line
    } catch (err) {
        echo.mErr(err, { lb: 6, msg: 'TEST #2: === Должна быть правильная ссылка на вызов === >>>' });
    }
    return x;
}

// ############################################################

async function test3 () {
    await db.getPoolConnection('db_in_config');
}

// ############################################################


async function test4 () {
    await db.getPoolConnection('db_NOT_in_config', '', true);
}


// ############################################################


function test5 () {
    const x = 1;
    const y = 1;
    // line
    // line
    echo.mErr(null, { lb: 4, msg: 'TEST5: Ссылка первого фрейма должна указывать на строку с (const x = 1)' });
    return x + y;
}

(async function foo () {
    try {
        test1();
    } catch (e) {
        //
    }
    console.log('\n');
    await test2();
    console.log('\n');
    await test3();
    console.log('\n');
    await test4();
    console.log('\n');
    await test5();
}());
