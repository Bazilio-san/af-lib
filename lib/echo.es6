'use strict';

/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
/* eslint-disable no-control-regex */
/* eslint-disable max-len */

const _ = require('lodash');
const config = require('config');

// clear from the cursor position to the beginning of the line: echo -e "\033[1K"
// Or everything on the line, regardless of cursor position: echo -e "\033[2K"
// echo -e '\033[2K'  # clear the screen and do not move the position
// or:
//    echo -e '\033[2J\033[u' # clear the screen and reset the position
// http://ascii-table.com/ansi-escape-sequences.php

/**
 * Класс реализует функции логирования в консоль
 * с возможностью раскраски текста и указания уровня логирования.
 */
class Echo {
    constructor () {
        this.reset = '\x1b[0m';
        this.clear = '\x1b[K';

        this.Bold = '\x1b[1m';
        this.Italics = '\x1b[3m';
        this.Underline = '\x1b[4m';
        this.Blink = '\x1b[5m';
        this.Inverse = '\x1b[7m';

        this.BoldOff = '\x1b[21m';
        this.ItalicsOff = '\x1b[23m';
        this.UnderlineOff = '\x1b[24m';
        this.BlinkOff = '\x1b[25m';
        this.InverseOff = '\x1b[27m';

        this.ResetForeground = 39;
        this.Default = 39;

        this.ResetBackground = 49;

        this.Black = 30;
        this.Red = 31;
        this.Green = 32;
        this.Yellow = 33;
        this.Blue = 34;
        this.Magenta = 35;
        this.Cyan = 36;
        this.White = 37;
        this.LGray = 90;
        this.LRed = 91;
        this.LGreen = 92;
        this.LYellow = 93;
        this.LBlue = 94;
        this.LMagenta = 95;
        this.LCyan = 96;
        this.LWhite = 97;

        this.bgBlack = 40;
        this.bgRed = 41;
        this.bgGreen = 42;
        this.bgYellow = 43;
        this.bgBlue = 44;
        this.bgMagenta = 45;
        this.bgCyan = 46;
        this.bgWhite = 47;
        this.bgDefault = 49;
        this.bgLGray = 100;
        this.bgLRed = 101;
        this.bgLGreen = 102;
        this.bgLYellow = 103;
        this.bgLBlue = 104;
        this.bgLMagenta = 105;
        this.bgLCyan = 106;
        this.bgLWhite = 107;

        this.colorBlack = '\x1b[30m';
        this.colorRed = '\x1b[31m';
        this.colorGreen = '\x1b[32m';
        this.colorYellow = '\x1b[33m';
        this.colorBlue = '\x1b[34m';
        this.colorMagenta = '\x1b[35m';
        this.colorCyan = '\x1b[36m';
        this.colorWhite = '\x1b[37m';
        this.colorDefault = '\x1b[39m';
        this.colorLGray = '\x1b[90m';
        this.colorLRed = '\x1b[91m';
        this.colorLGreen = '\x1b[92m';
        this.colorLYellow = '\x1b[93m';
        this.colorLBlue = '\x1b[94m';
        this.colorLMagenta = '\x1b[95m';
        this.colorLCyan = '\x1b[96m';
        this.colorLWhite = '\x1b[97m';

        this.colorResetForeground = '\x1b[39m';
        this.colorResetBackground = '\x1b[49m';
        this.prefix = '';
        /**
         * @type {('error'|0|'warn'|1|'info'|2|'verbose'|3|'debug'|4|'silly'|5)} levels
         */
        this.levels = {
            error: 0,
            warn: 1,
            info: 2,
            verbose: 3,
            debug: 4,
            silly: 5
        };
        this.strlevels = ['error', 'warn', 'info', 'verbose', 'debug', 'silly'];
        this.levelColors = {
            '-1': this.Blue,
            0: this.Red,
            1: this.Yellow,
            2: this.Green,
            3: this.Magenta,
            4: this.Cyan,
            5: this.Blue
        };
        this.defaultLevel = 'info';
        this.defaultILevel = this.levels[this.defaultLevel];
        try {
            this.level = config.get('logger.level');
        } catch (err) {
            this.level = this.defaultLevel;
        }
        if (this.levels[this.level] === undefined) {
            this.level = this.defaultLevel;
        }
        this.iLevel = this.levels[this.level];
        // eslint-disable-next-line max-len
        this.echoOptionsProps = [
            'colorNum',
            'bgColorNum',
            'bold',
            'underscore',
            'reverse',
            'prefix',
            'consoleFunction',
            'logger'
        ];
        this.process_debug = !!process.env.DEBUG;
    }

    /**
     * @typedef {Object} echoOptions
     *
     * @param {Number} [colorNum]
     * @param {Number} [bgColorNum]
     * @param {Boolean} [bold]
     * @param {Boolean} [underscore]
     * @param {Boolean} [reverse]
     * @param {String} [prefix]
     * @param {String} [consoleFunction]
     * @param {Object} [logger]
     * @param {Object} [estimate]
     * @param {Boolean} [estimateReset]
     * @param {Number} [linesBefore] - количество пустых строк перед выводом. default = 0
     */

    /**
     * Проверяет, является ли аргумент объектом типа echoOptions
     * @param {*} obj
     * @returns {Boolean}
     */
    isEchoOptions (obj) {
        if (!obj || typeof obj !== 'object') {
            return false;
        }
        const props = Object.keys(obj);
        return this.echoOptionsProps.some((prop) => props.includes(prop));
    }

    /**
     * Формирует строку - escape-последовательность для раскраски текста в консоли
     * @param {echoOptions} options
     * @returns {string}
     */
    c (options = {}) {
        const {
            colorNum = 0,
            bgColorNum = 0,
            bold = false,
            underscore = false,
            reverse = false
        } = options;
        const modifier = (bold ? 1 : 0) + (underscore ? 4 : 0) + (reverse ? 7 : 0);
        let color = !bgColorNum ? '49' : bgColorNum;
        color += `;${!colorNum ? this.Default : colorNum}${!modifier ? '' : `;${modifier}`}m`;
        // color = (color === "49;39m" ? "" : `\x1b[${color}`);
        color = `\x1b[${color}`;
        return color;
    }

    /**
     * Функция вывода сообщения в консоль с возможностью раскраски и задания префикса.
     *
     * @param {String} msg
     * @param {echoOptions} [options]
     */
    echo (msg, options = {}) {
        const { logger, prefix = this.prefix, consoleFunction = 'log' } = options;
        const color = this.c(options);
        if (consoleFunction === 'dir') {
            console.dir(msg);
        } else {
            console.log(`${color}${this.UnderlineOff}${prefix}${msg}${this.reset}`);
        }
        if (logger) {
            logger.info(`${prefix}${msg.replace(/\[\d+m/g, '')}`);
        }
    }

    /**
     * Возвращает номер уровня по его текстовому представлению или собственно номер, если передано число
     * @param {String|Number} level
     * @param {Boolean} noDefault - Если уровень не распознан, то,
     *      когда noDefault = false вернется уровень по умолчанию. Иначе = undefined
     * @returns {Number}
     */
    getILevel (level, noDefault = false) {
        if (typeof level === 'number' && level < 0) {
            return -1;
        }
        if (/^[012345]$/.test(String(level))) {
            return Number(level);
        }
        level = (String(level)).toLowerCase();
        const iLevel = this.levels[level];
        if (iLevel === undefined) {
            return noDefault ? undefined : this.levels[this.defaultLevel];
        }
        return iLevel;
    }

    /**
     * Проверяет, возможен ли вывод сообщений с указанным уровнем
     * @param {String|Number} level
     * @param {String|Number} [compareLevel]
     * @returns {Boolean}
     */
    isLevelAllowed (level, compareLevel) {
        if (typeof level === 'number' && level < 0) {
            return true;
        }
        if (compareLevel != null) {
            const iCompareLevel = this.getILevel(compareLevel, true);
            if (iCompareLevel != null) {
                return this.getILevel(level) <= iCompareLevel;
            }
        }
        return this.getILevel(level) <= this.iLevel;
    }

    /**
     * Удаляет ESC-gjcktljdfntkmyjcnb bp cnhjrb (для записи в лог)
     * @param {String} str
     * @returns {String}
     */
    clrESC (str) {
        return str.replace(/\[[\d;]+m/ig, '');
    }

    /**
     * Функция вывода сообщения заданного уровня в консоль.
     * Если уровень сообщения больше заданного конфигурацией, сообщение не будет выведено.
     * Кроме того функция позволяет раскрашивать текст и добавлять кастомный префикс
     *
     * @param {Number|String} level
     * @param {array} args
     *
     * log(level, msg, options = {})
     * log(level, title, msg, options = {})
     *
     */
    log (level, ...args) {
        const iLevel = this.getILevel(level);
        if (iLevel > this.iLevel) return;

        /** @type {String} */
        let msg = '';

        /** @type {String} */
        let title = '';

        /** @type {echoOptions} */
        let options = {};

        switch (typeof args[1]) {
            case 'object':
                if (this.isEchoOptions(args[1])) {
                    [msg, options = {}] = args;
                } else if (args[1] == null) {
                    [msg] = args;
                } else {
                    [title, msg, options = {}] = args;
                }
                break;
            case 'string':
            case 'number':
            case 'boolean':
                [title, msg, options = {}] = args;
                break;
            default:
                [msg] = args;
        }
        if (typeof msg === 'object') {
            if (options.formatJSON || options.fj) {
                msg = JSON.stringify(msg, undefined, 2);
            } else {
                msg = JSON.stringify(msg);
            }
        }
        if (/^ *SELECT /.test(msg)) {
            msg = `${this.colorMagenta}\n${msg}\n`;
        }
        /** @type {echoOptions} */
        const {
            colorNum,
            logger,
            prefix = this.prefix,
            consoleFunction = 'log',
            estimate,
            estimateReset = false,
            lfBefore = 0
        } = options;

        options.colorNum = colorNum || this.levelColors[iLevel];
        const color = this.c(options);
        if (estimate) {
            title = `${estimate.getTaken(estimateReset, true)} ${title || ''}`;
        }
        const lb = Number(lfBefore) ? '\n'.repeat(Number(lfBefore)) : '';
        const cTitle = title ? `\x1b[1m${title}: \x1b[21m` : '';
        if (consoleFunction === 'dir') {
            console.dir(msg);
        } else {
            console.log(`${lb}${color}${this.UnderlineOff}${prefix}${cTitle}${this.UnderlineOff}${msg}${this.reset}`);
        }
        if (logger) {
            logger[this.strlevels[iLevel]](this.clrESC(`${prefix}${title}${prefix || title ? ': ' : ''}${msg}`));
        }
    }

    error (...args) {
        this.log(0, ...args);
    }

    warn (...args) {
        this.log(1, ...args);
    }

    info (...args) {
        this.log(2, ...args);
    }

    verbose (...args) {
        this.log(3, ...args);
    }

    debug (...args) {
        this.log(4, ...args);
    }

    silly (...args) {
        this.log(5, ...args);
    }

    sql (...args) {
        if (global._sql_ || process.env.DEBUG === '*' || /\bsql\b/.test(process.env.DEBUG)) {
            if (typeof args[2] !== 'object') {
                args[2] = {};
            }
            args[2].formatJSON = true;
            args[0] = `SQL [${args[0]}]`;
            this.log(-1, ...args);
        }
    }

    /**
     * Вывод красного сообщения в консоль
     * @param {String} msg
     * @param {mErrOptions} options
     */
    err (msg, options = {}) {
        this.echo(msg, Object.assign(options, { colorNum: this.Red }));
    }

    /**
     * Вывод сообщения в консоль и возврат курсора на указанное количество строк назад
     * Позволяет организовать "заменяемые сообщения" в консоли Unix
     * @param {String} msg
     * @param {Number} lines
     */
    roll (msg, lines = 1) {
        if (process.stdin.isTTY) {
            process.stdout.write(`\x1b[${lines}A${msg}\x1b[K\n`);
        } else {
            this.echo(msg);
        }
    }

    /**
     * @typedef {Object} callStackFrame
     *
     * @param {String} line - вся строка (trimmed)
     * @param {String} func - функция / модуль
     * @param {String} file
     * @param {Number} row
     * @param {Number} col
     */

    /**
     * Получает в виде объекта сведения об одном фрейме из стека вызовов по строке этого фрейма
     * @param {String} callStackFrameStr
     * @returns {callStackFrame}
     */
    getCallStackFrameObj (callStackFrameStr) {
        // eslint-disable-next-line no-unused-vars
        const t = this; // Заглушка
        if (!callStackFrameStr) {
            return;
        }
        const match = (/^([ \t]*at[ \t]+)([^(]*)\(([^)]+):(\d+):(\d+)\)/).exec(String(callStackFrameStr));
        if (match) {
            return {
                line: match[0].trim,
                func: (match[2] || '').trim(),
                file: match[3],
                row: Number(match[4]) || 0,
                col: Number(match[5]) || 0
            };
        }
    }

    /**
     * Парсит стак трейс в массив объектов (элемент с индексом 1 - заголовок)
     * @param {String} stack
     * @returns {callStackFrame[]}
     */
    parseStackTrace (stack) {
        if (!stack || typeof stack !== 'string' || !stack.trim()) {
            return;
        }
        stack = stack.trim();
        const stackArr = stack.split(/[\r\n]+/).filter((v) => !!v.trim());
        if (stackArr.length < 2) {
            return;
        }
        const line = stackArr.shift();
        const t = this;
        const stackArr2 = stackArr.map(t.getCallStackFrameObj).filter((v) => !!v);
        return [{ line }, ...stackArr2];
    }

    /**
     * Восстанавливает стак трейс из массива фреймов
     * @param {callStackFrame[]} stackArr
     * @returns {String}
     */
    stackTraceFromArray (stackArr) {
        // eslint-disable-next-line no-unused-vars
        const t = this;
        if (!Array.isArray(stackArr)) {
            return String(stackArr);
        }
        return stackArr.map((frame, index) => {
            if (index === 0) {
                return frame.line;
            }
            return `    at ${frame.func || '<>'} (${frame.file || ''}:${frame.row || 0}:${frame.col || 0})`.replace(' (:0:0)', '');
        }).join('\n');
    }

    /**
     * Удаляет из массива фреймов стак-трейса системные вызовы
     * @param {callStackFrame[]} stackArr
     */
    removeNativeCallFrames (stackArr) {
        if (this.process_debug) {
            return;
        }
        let catIndex = 0;
        stackArr.some((frame, index) => {
            const isNativeCall = /^(process|Module)\._/.test(frame.func);
            if (isNativeCall) {
                catIndex = index;
            }
            return isNativeCall;
        });
        if (catIndex > 0) {
            stackArr.splice(catIndex, stackArr.length - catIndex);
        }
    }

    /**
     * @typedef {Object} mErrOptions
     *
     * @param {Number} [lb] - "lines back" - на сколько строк вверх скорректировать точку возникновения ошибки в последней функции в стеке
     * @param {Error} [helpErr] - вспомогательный объект, несущий в callstack сведения о вызовах родительской функции
     * @param {String} [msg] - дополнительное сообщение
     * @param {Boolean} [nc] - "no console" - если true, то не выводить сообщение об ошибке в консоль
     * @param {Boolean} [thr] - "is throw error" - если true, ошибка будет выброшена снова
     * @param {Object} [errorLogger] - объект для логирования
     */

    /**
     * @param {Error} err
     * @param {mErrOptions} [options]
     */
    mErr (err, options) {
        if (!_.isObject(options)) {
            options = {};
        }
        if (!err || typeof err !== 'object') {
            err = {};
        }
        const { lb = 0, nc, msg, thr, errorLogger, prefix, noStack = false } = options;

        let targetFrame;

        function frameSearch (frame) {
            return frame.func === targetFrame.func && frame.file === targetFrame.file;
        }

        if (!noStack) {
            const newError = new Error();
            let tmpStackArr = this.parseStackTrace(newError.stack) || [];
            let header = tmpStackArr[0];
            tmpStackArr.splice(0, 2); // Удаляем заголовок (Error) и первую строку стека (сведения о строке c new Error())
            [targetFrame] = tmpStackArr;
            this.removeNativeCallFrames(tmpStackArr);

            if (options.helpErr) {
                const helpStackArr = this.parseStackTrace(options.helpErr.stack) || [];
                if (helpStackArr.length > 1) {
                    header = helpStackArr.shift(); // Удаляем и запоминаем заголовок из массива
                    // Если используется вспомогательный объект ошибки, то целевой фрейм берем оттуда
                    // targetFrame = helpStackArr[0];
                    this.removeNativeCallFrames(helpStackArr);
                    tmpStackArr = helpStackArr;
                }
            }
            targetFrame.row -= lb;
            targetFrame.col = 20;

            let stackArr;
            let fuFrameIndex;

            stackArr = this.parseStackTrace(err.stack);
            if (stackArr) { // length > 1
                header = stackArr.shift();
                fuFrameIndex = stackArr.findIndex(frameSearch);
                this.removeNativeCallFrames(stackArr);
                // Если в стеке из err нет упоминания о родительской функции,
                // то добавляем эту информацию из tmpStackArr Между заголовком и первой строкой стека
                // (пример - ошибка открытия соединения с бд)
                if (fuFrameIndex === -1) {
                    stackArr = [...tmpStackArr, { func: '#=== original err.stack ===#' }, ...stackArr];
                }
            } else {
                stackArr = tmpStackArr;
            }
            fuFrameIndex = stackArr.findIndex(frameSearch);

            if (fuFrameIndex > 0 && this.iLevel > 3) { // debug, silly
                // помечаем нужный фрейм. Если он не первый
                stackArr[fuFrameIndex].func = `===> ${stackArr[fuFrameIndex].func}`;
            }
            stackArr = [header, ...stackArr];
            err.stack = this.stackTraceFromArray(stackArr);
        } else {
            err.stack = '';
        }

        let message4Logger;
        if (errorLogger && err && err.message && /^@/.test(err.message)) {
            message4Logger = err.message.substr(1);
        }
        let message = `${(err && err.stack) || ''}`;
        if (err && err.message) {
            message = `${err.message} >>> \n${message}`;
        }
        if (msg) {
            if (err && err.message) {
                err.message = `${msg} >>> \n${err.message}`;
            }
            message = `${msg} >>> \n${message}`;
        }

        options.message = message;

        if (!nc && !thr) {
            this.err(message, { prefix });
        }
        if (errorLogger) {
            errorLogger.error(this.clrESC(`${prefix ? `${prefix}: ` : ''}${message4Logger || message}`));
        }
        if (thr) {
            throw err;
        }
    }
}

module.exports = new Echo();
