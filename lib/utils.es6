/* eslint-disable no-console */
/* eslint-disable max-len */
/* eslint-disable no-trailing-spaces */

const _ = require('lodash');
const moment = require('moment');
const crypto = require('crypto');
const XXH = require('xxhashjs');
const { v5: uuidv5 } = require('uuid');

module.exports = {
    getRecognitionScore (unrecognizedString, recognizedString) {
        if (!unrecognizedString) return 10;
        return Math.round(Math.max(0, (1 - (unrecognizedString.replace(this.nonWordCharRe, '').length / recognizedString.replace(this.nonWordCharRe, '').length))) * 10);
    },

    pad (num, numberOfSymbols) {
        const str = `00000${num}`;
        return str.slice(-numberOfSymbols);
    },

    getRnd () {
        return Math.random().toString().slice(2, 11) + Math.random().toString().slice(2, 6);
    },

    removeExrtaCahrs (str) {
        return str.replace(/\u00A0/g, ' ');
    },

    normalizeString (str) {
        if (!str) return '';
        str = module.exports.removeExrtaCahrs(str);
        str = str.replace(/\s+/g, ' ');
        str = str.trim();
        return str;
    },

    exitProc (exitCode = 0) {
        setTimeout(process.exit(exitCode), 500);
    },

    sleep (timeOut) {
        return new Promise((resolve) => {
            setTimeout(resolve, timeOut);
        });
    },
    /**
     * Возвращает MD5 хеш данных.
     * @param {string|Buffer|Array|DataView} data
     * @param {Boolean} asTsqlUniqueidentifier - Если TRUE, то хеш возвращается так,
     * как его вернуло бы выражение T-SQL: CAST(HASHBYTES('MD5', @data) AS UNIQUEIDENTIFIER);
     * @returns {string}
     */
    hash (data, asTsqlUniqueidentifier = false) {
        const x = crypto.createHash('md5').update(data).digest('hex');
        if (!asTsqlUniqueidentifier) {
            return x;
        }
        return `${x.substring(6, 8)
        + x.substring(4, 6)
        + x.substring(2, 4)
        + x.substring(0, 2)
        }-${x.substring(10, 12)
        }${x.substring(8, 10)
        }-${x.substring(14, 16)
        }${x.substring(12, 14)
        }-${x.substring(16, 20)
        }-${x.substring(20, 32)}`.toUpperCase();
    },

    xxHash (data, base = '32', seed = 0xCAFEBABE) {
        let stringToHash = '';
        if (data === undefined) {
            stringToHash = '#thisisundefined#';
        } else if (data === null) {
            stringToHash = '#thisisnull#';
        } else if (data === '') {
            stringToHash = '#thisisemptystring#';
        } else if (_.isArray(data)) {
            stringToHash = JSON.stringify(_.sortBy(data, [
                (value) => this.xxHash32(String(value) + (typeof value), seed)
            ]));
        } else if (_.isObject(data)) {
            const op = Object.prototype.toString.call(data); // === '[object Date]'
            switch (op) {
                case '[object Function]':
                case '[object Date]':
                    stringToHash += data.toString();
                    break;
                // case '[object Object]':
                default: {
                    const keys = Object.keys(data).sort();
                    keys.forEach((key) => {
                        stringToHash += key + this.xxHash(data[key], base, seed);
                    });
                }
            }
        } else if (typeof data === 'string') {
            stringToHash = data;
        } else if (typeof data === 'number') {
            stringToHash = `i${String(data)}`;
        } else if (typeof data === 'boolean') {
            stringToHash = `b${data ? 1 : 0}`;
        } else if (typeof data === 'function') {
            stringToHash = `f${data.toString()}`;
        }
        let hash;
        switch (String(base)) {
            case '64':
                hash = XXH.h64(stringToHash, seed).toString(16);
                break;
            default:
                hash = XXH.h32(stringToHash, seed).toString(16);
        }
        return hash;
    },

    xxHash32 (data, seed = 0xCAFEBABE) {
        return this.xxHash(data, 32, seed).toString(16);
    },

    xxHash64 (data, seed = 0xCAFEBABE) {
        return this.xxHash(data, 64, seed).toString(16);
    },

    /**
     * Возвращает UUID для переданных данных
     * @param {*} data
     * @returns {string}
     */
    getUID (data) {
        const stringToHash = this.xxHash64(data);
        return uuidv5(stringToHash, '7D51C591-6202-4372-85F2-DF407E734B04');
    },

    formatMilliseconds (timeToFormatMs, isShowMilliseconds) {
        let seconds = (timeToFormatMs / 1000).toFixed(0);
        let minutes = Math.floor(seconds / 60);
        let hours = '';
        if (minutes > 59) {
            hours = Math.floor(minutes / 60);
            hours = (hours >= 10) ? hours : `0${hours}`;
            minutes -= (hours * 60);
            minutes = (minutes >= 10) ? minutes : `0${minutes}`;
        }

        seconds = Math.floor(seconds % 60);
        seconds = (seconds >= 10) ? `${seconds}"` : `0${seconds}"`;
        if (isShowMilliseconds && !hours) {
            seconds = `${seconds}.${module.exports.pad(Math.floor(timeToFormatMs % 1000), 3)}`
                .replace(`0'00".00`, '        ')
                .replace(`0'00".0`, '       ')
                .replace(`0'00".`, '      ')
                .replace(`0'0`, '   ')
                .replace(`0'`, '  ');
        }
        if (hours !== '') {
            return `${hours}:${minutes}'${seconds}`;
        }
        return `${minutes}'${seconds}`;
    },

    /**
     * Преобразует объект статистики вида { key1: stat1, key2: stat2...}
     * в строку key1\tstat1\nkey2\tstat2\n готовую для копирования в Excel
     * @param {object} obj
     * @returns {string}
     */
    statObj2excel (obj) {
        return _.sortBy(_.map(obj, (val, name) => ({
            n: `${name}\t${val}`,
            v: 99999999 - val
        })), 'v').map((item) => item.n).join('\n');
    },

    getPercent (part, total, precision = 0) {
        return Math.round((part / total) * 100 * (10 ** precision)) / (10 ** precision);
    },

    stripTags (str) {
        return (str.toString()).replace(/<\/?[^>]+>/gi, '');
    },

    compactHtml (html) {
        return html.replace(/\r/img, '\n')
            .replace(/<!--(.|\n)+?-->/img, ' ') // Удаляем HTML комментарии
            .replace(/<([A-Z][A-Z0-9]*)\b[^>]*>/img, '<$1>') // Удаляем атрибуты HTML тегов
            .replace(/[\t ]+/img, ' ')
            .replace(/\n\s*\n/img, '\r')
            .replace(/^\s+/img, '')
            .replace(/\s+$/img, '')
            .trim();
    },

    avg (arr) {
        return arr.reduce((p, c, i, a) => (p + (c / a.length)), 0);
    },

    getTimeStamp (options = {}) {
        const dateTime = new Date();
        const year = dateTime.getFullYear() - 2000;
        const month = dateTime.getMonth() + 1;
        const date = dateTime.getDate();
        const hour = dateTime.getHours();
        const mins = dateTime.getMinutes();
        const secs = dateTime.getSeconds();
        const msecs = dateTime.getMilliseconds();
        return `${this.pad(year, 2) + this.pad(month, 2) + this.pad(date, 2)}-${
            this.pad(hour, 2)}${this.pad(mins, 2)}${
            options.seconds ? `.${this.pad(secs, 2)}` : ''}${
            options.milliseconds ? `.${this.pad(msecs, 3)}` : ''}`;
    },

    /**
     * Экранирование одинарной кавычки и символа % для использования строки в SQL запросе
     * (se - сокращение от SQL Escape)
     * @param {*} str
     * @param {Boolean} onlySingleQuotes - true - не экранировать %
     * @returns {string}
     */
    se (str, onlySingleQuotes = false) {
        if (str == null) {
            str = '';
        }
        switch (typeof str) {
            case 'number':
                str = String(str);
                break;
            case 'string':
                break;
            case 'boolean':
                str = str ? '1' : '0';
                break;
            default:
                str = String(str || '');
        }
        str = str.replace(/[']/g, `''`);
        if (onlySingleQuotes) {
            return str;
        }
        return str.replace(/[%]/g, '%%');
    },

    s (str, isNull, len, escapeOnlySingleQuotes = false) {
        str = (String(str || '')).trim();
        if (isNull && !str) {
            return 'NULL';
        }
        str = module.exports.se(str, escapeOnlySingleQuotes);
        if (len > 0) {
            str = str.substr(0, len);
        }
        return `'${str}'`;
    },

    /**
     * Форматирует дату-время по заданной формат-маске
     * @param {Date|String} dt
     * @param {String|'s'|'sec'|'ms'|'m'|'min'|'h'|'hour'|'d'|'day'|'mm'|'mo'|'month'|'y'|'yyyy'} format
     * @param {String} timeZone
     * @returns {String}
     */
    fd (dt, format = 'YYYY-MM-DD HH:mm', timeZone) {
        if (!dt) {
            return null;
        }
        let mom;
        if (dt instanceof moment) {
            mom = dt;
        } else if (dt instanceof Date) {
            const year = dt.getFullYear();
            const month = dt.getMonth();
            const date = dt.getDate();
            const hour = dt.getHours();
            const minute = dt.getMinutes();
            const seconds = dt.getSeconds();
            const milliseconds = dt.getMilliseconds();
            mom = moment({ year, month, date, hour, minute, seconds, milliseconds });
        } else if (typeof dt === 'string' || typeof dt === 'number') {
            mom = moment(dt);
        } else {
            return null;
        }
        if (!mom.isValid()) {
            return null;
        }
        if (timeZone) {
            mom = mom.tz(timeZone);
        }
        switch (format.toLowerCase()) {
            case 's':
            case 'sec':
                format = 'YYYY-MM-DD HH:mm:ss';
                break;
            case 'ms':
                format = 'YYYY-MM-DD HH:mm:ss.SSS';
                break;
            case 'm':
            case 'min':
                format = 'YYYY-MM-DD HH:mm';
                break;
            case 'h':
            case 'hour':
                format = 'YYYY-MM-DD HH';
                break;
            case 'd':
            case 'day':
                format = 'YYYY-MM-DD';
                break;
            case 'mm':
            case 'mo':
            case 'month':
                format = 'YYYY-MM';
                break;
            case 'y':
            case 'yyyy':
                format = 'YYYY';
                break;
            case null:
                format = 'YYYY-MM-DD HH:mm';
                break;
            default:
            // format как передан
        }
        return mom.format(format);
    },

    /**
     * Парсит строку вида name1<delim2>value1<delimBetweenPairs>name2<delim2>value2...
     * в объект {name1: value1, name2: value2}
     * @param {String} str
     * @param {String} delimBetweenPairs - разделитель отдельных пар
     * @param {String} delimBetweenNameAndValue - разделитель между именем и значение м в паре
     * @returns {{}}
     */
    parsePairs (str, delimBetweenPairs = '&', delimBetweenNameAndValue = '=') {
        return _.fromPairs(
            str.split(delimBetweenPairs)
                .filter((p) => p.trim())
                .map((p) => (p.split(delimBetweenNameAndValue).map((v) => (v || '').trim())))
                .filter((p) => (p[1] || '').trim())
        );
    },

    /**
     * Возвращает true или false
     * Строки "true", "jes", "да", "1" трактуются, как true
     * @param v
     * @returns {boolean}
     */
    getBool (v) {
        if (typeof v === 'string') {
            return /^(true|1|yes)$/i.test(v);
        }
        return !!v;
    },

    delay (t, v) {
        return new Promise((resolve) => {
            setTimeout(resolve.bind(null, v), t);
        });
    }
};
