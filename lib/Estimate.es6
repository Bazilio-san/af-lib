'use strict';

/* eslint-disable max-len */

const Utils = require('./utils.es6');

class Estimate {
    constructor (total) {
        this.total = total;
        this.startTime = +new Date();
        this.startCircleTime = +new Date();
        this.echo = require('./echo.es6');
    }

    startProgress (total, roll = 0, msgAdd, echoLevel = 2) {
        this.total = total;
        this.startCircleTime = +new Date();
        const E = this.echo;
        const msg = `${E.reset}К началу обработки затрачено времени: ${E.colorBlue}${
            Utils.formatMilliseconds(+new Date() - this.startTime)}${msgAdd ? `${E.reset} / ${msgAdd}` : ''}`;
        if (process.stdin.isTTY && roll) {
            process.stdout.write(`\x1b[${roll}A${msg}\x1b[K\n`);
        } else {
            E.log(echoLevel, msg);
        }
    }

    setTotal (total) {
        this.total = total;
    }

    print (processed, options) {
        const defaultOptions = {
            showPercent: true,
            showCount: true,
            showTakenTime: true,
            roll: 0,
            msg: '',
            of: null // {text: '', processed: null,  total: null}
        };
        if (typeof options === 'string') {
            defaultOptions.msg = options;
            options = defaultOptions;
        } else {
            options = Object.assign(defaultOptions, options);
        }
        const E = this.echo;
        if (!this.total) {
            E.echo(`"Estimate": не могу рассчитать время, не задан параметр "total"`, 0);
            return;
        }

        const txtOf = (options.of && options.of.text) || '';
        const txtProcessed = (options.of && options.of.processed) || processed;
        const txtTotal = (options.of && options.of.total) || this.total;
        let processedString = options.showPercent ? `${E.colorBlue}${Math.ceil((txtProcessed / txtTotal) * 100)}${E.reset}%` : '';
        const countString = options.showCount ? `${txtOf}${E.colorBlue}${txtProcessed} ${E.reset}из ${E.colorBlue}${txtTotal}` : '';
        processedString += (processedString ? ' (' : '') + countString + (processedString ? `${E.reset})` : '');
        let leftString = `${E.reset}Осталось: ${E.colorBlue}`;
        if (processed) {
            const msLeft = (+new Date() - this.startCircleTime) * ((this.total / processed) - 1);
            leftString += Utils.formatMilliseconds(msLeft);
        } else {
            leftString = '';
        }
        const processedTime = options.showTakenTime ? `${E.reset} / Прошло ${E.colorBlue}${this.getTaken()} ${E.reset}` : '';
        const roll = options.roll || 0;
        const msgAdd = options.msg || '';
        const msg = `${E.reset}Обработано ${processedString}${E.reset}. ${leftString}${processedTime}${msgAdd ? `${E.reset} / ${msgAdd}` : ''} `;
        if (process.stdin.isTTY && roll) {
            process.stdout.write(`\x1b[${roll}A${msg}\x1b[K\n`);
        } else {
            E.echo(msg, 0);
        }
    }

    getTaken (isReset = false, isShowMilliseconds = false) {
        const taken = Utils.formatMilliseconds(+new Date() - this.startTime, isShowMilliseconds);
        if (isReset) {
            this.reset();
        }
        return taken;
    }

    getRest (processed, fromStart) {
        if (processed && this.total) {
            const msLeft = (+new Date() - (fromStart ? this.startTime : this.startCircleTime)) * ((this.total / processed) - 1);
            return Utils.formatMilliseconds(msLeft);
        }
        return '';
    }

    taken (roll = 0, msgAdd = '', options) {
        const E = this.echo;
        const msg = `${E.reset}Затрачено времени: ${E.colorBlue}${this.getTaken()}${msgAdd ? `${E.reset} / ${msgAdd}` : ''}`;
        if (process.stdin.isTTY && roll) {
            process.stdout.write(`\x1b[${roll}A${msg}\x1b[K\n`);
        } else {
            E.echo(msg, options);
        }
    }

    reset () {
        this.startTime = +new Date();
        this.startCircleTime = +new Date();
    }
}

module.exports = Estimate;
