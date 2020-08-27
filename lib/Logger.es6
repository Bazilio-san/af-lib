'use strict';

/* eslint-disable no-console */

const appRoot = require('app-root-path');
const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');

const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');

/**
 * Удаляет файл, если его размер равен 0
 * Используется для удаления пустых логов в момент ежедневной ротации
 * @param filename
 */
function removeEmptyLog (filename) {
    if (filename) {
        try {
            if (fs.existsSync(filename)) {
                const { size } = fs.statSync(filename);
                if (!size) {
                    fs.unlinkSync(filename);
                }
            }
        } catch (err) {
            console.log(err.message);
        }
    }
}

class Logger {
    constructor (
        suffix,
        removeEmptyErrorFiles = false,
        removeEmptyLogFiles = false,
        logDir,
        emitter
    ) {
        const options = typeof suffix === 'object' ? { ...suffix } : {
            suffix,
            removeEmptyErrorFiles,
            removeEmptyLogFiles,
            logDir
        };
        this.emitter = emitter;
        const prefix = options.prefix == null ? 'sync-' : options.prefix;
        const errorPrefix = options.errorPrefix == null ? 'error-sync-' : options.errorPrefix;
        logDir = options.logDir;
        suffix = options.suffix;

        const errorFileTemplate = `${errorPrefix}${suffix}-%DATE%.log`;
        const errorFileRe = new RegExp(`${errorPrefix}${suffix}-([\\d-]{10})\\.log$`);
        const logFileTemplate = `${prefix}${suffix}-%DATE%.log`;
        const logFileRe = new RegExp(`${prefix}${suffix}-([\\d-]{10})\\.log$`);
        if (!logDir) {
            logDir = path.resolve(appRoot.path, `../logs`);
        }
        this.logDir = logDir;

        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir);
        }

        const transportError = new (transports.DailyRotateFile)({
            name: 'error-file',
            level: 'error',
            filename: `${logDir}${path.sep}error${path.sep}${errorFileTemplate}`,
            'json': false,
            datePattern: 'YYYY-MM-DD',
            'prepend': true,
            // zippedArchive: true,
            maxSize: '20m'
            // maxFiles: '14d'
        });
        transportError.on('rotate', this.onRotateErrorLog);
        transportError.on('new', this.onNewErrorLog);
        this.errorLogger = createLogger({
            transports: [transportError],
            format: format.combine(
                format.timestamp({ format: 'HH:mm:ss' }),
                format.printf((info) => `${info.timestamp}: ${info.message}`)
            )
        });
        this.errorLogger.re = errorFileRe;
        const transportSuccess = new (transports.DailyRotateFile)({
            name: 'success-file',
            level: 'info',
            filename: `${logDir}${path.sep}${logFileTemplate}`,
            'json': false,
            datePattern: 'YYYY-MM-DD',
            'prepend': true
        });
        transportSuccess.on('rotate', this.onRotateSuccessLog);
        transportError.on('new', this.onNewSuccessLog);
        this.successLogger = createLogger({
            transports: [transportSuccess],
            format: format.combine(
                format.timestamp({ format: 'HH:mm:ss' }),
                format.printf((info) => `${info.timestamp}: ${info.message}`)
            )
        });
        this.successLogger.re = logFileRe;

        this.loggerFinish = (exitCode = 0) => {
            transportSuccess.on('finish', () => {
                transportError.on('finish', () => {
                    process.exit(exitCode);
                });
                transportError.close();
            });
            transportSuccess.close();
        };
        let p = this.successLogger._readableState.pipes;
        this.successLogger._where = `${p.dirname}${path.sep}${p.filename}`;
        p = this.errorLogger._readableState.pipes;
        this.errorLogger._where = `${p.dirname}${path.sep}${p.filename}`;

        /**
         * Удаляет пустые файлы с датой создания старше текущей из указанной директории
         * @param {Object} logger
         */
        this.removeOldEmptyFiles = (logger) => {
            const { dirname } = logger._readableState.pipes;
            try {
                fs.readdirSync(dirname)
                    .forEach((fileName) => {
                        const fullPath = path.join(dirname, fileName);
                        const stat = fs.lstatSync(fullPath);
                        const isFile = stat.isFile();
                        if (!isFile || stat.size) {
                            return;
                        }
                        const match = logger.re.exec(fileName);
                        if (!match) {
                            return;
                        }
                        if (match[1].replace(/-/g, '') < moment(new Date())
                            .format('YYYYMMDD')) {
                            fs.unlinkSync(fullPath);
                        }
                    });
            } catch (err) {
                console.log(err && err.message);
            }
        };
        this.removeOldEmptyErrorFiles = () => {
            this.removeOldEmptyFiles(this.errorLogger);
        };
        this.removeOldEmptyLogFiles = () => {
            this.removeOldEmptyFiles(this.successLogger);
        };
        if (options.removeEmptyErrorFiles) {
            this.removeOldEmptyErrorFiles();
        }
        if (options.removeEmptyLogFiles) {
            this.removeOldEmptyLogFiles();
        }
    }

    onNew (oldFilename, newFilename, logType) {
        if (this.emitter) {
            this.emitter.emit(`logNew${logType}`, {
                oldFilename,
                newFilename
            });
        }
    }

    onRotate (oldFilename, newFilename, logType) {
        if (this.emitter) {
            this.emitter.emit(`logRotate${logType}`, {
                oldFilename,
                newFilename
            });
        }
        removeEmptyLog(oldFilename);
    }

    onNewSuccessLog (oldFilename, newFilename) {
        this.onNew(oldFilename, newFilename, 'Success');
    }

    onRotateSuccessLog (oldFilename, newFilename) {
        this.onRotate(oldFilename, newFilename, 'Success');
    }

    onNewErrorLog (oldFilename, newFilename) {
        this.onNew(oldFilename, newFilename, 'Error');
    }

    onRotateErrorLog (oldFilename, newFilename) {
        this.onRotate(oldFilename, newFilename, 'Error');
    }
}

module.exports = Logger;
