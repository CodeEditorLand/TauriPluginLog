'use strict';

var event = require('@tauri-apps/api/event');
var primitives = require('@tauri-apps/api/primitives');

// Copyright 2019-2023 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT
var LogLevel;
(function (LogLevel) {
    /**
     * The "trace" level.
     *
     * Designates very low priority, often extremely verbose, information.
     */
    LogLevel[LogLevel["Trace"] = 1] = "Trace";
    /**
     * The "debug" level.
     *
     * Designates lower priority information.
     */
    LogLevel[LogLevel["Debug"] = 2] = "Debug";
    /**
     * The "info" level.
     *
     * Designates useful information.
     */
    LogLevel[LogLevel["Info"] = 3] = "Info";
    /**
     * The "warn" level.
     *
     * Designates hazardous situations.
     */
    LogLevel[LogLevel["Warn"] = 4] = "Warn";
    /**
     * The "error" level.
     *
     * Designates very serious errors.
     */
    LogLevel[LogLevel["Error"] = 5] = "Error";
})(LogLevel || (LogLevel = {}));
async function log(level, message, options) {
    const traces = new Error().stack?.split("\n").map((line) => line.split("@"));
    const filtered = traces?.filter(([name, location]) => {
        return name.length > 0 && location !== "[native code]";
    });
    const { file, line, keyValues } = options ?? {};
    let location = filtered?.[0]?.filter((v) => v.length > 0).join("@");
    if (location === "Error") {
        location = "webview::unknown";
    }
    await primitives.invoke("plugin:log|log", {
        level,
        message,
        location,
        file,
        line,
        keyValues,
    });
}
/**
 * Logs a message at the error level.
 *
 * @param message
 *
 * # Examples
 *
 * ```js
 * import { error } from '@tauri-apps/plugin-log';
 *
 * const err_info = "No connection";
 * const port = 22;
 *
 * error(`Error: ${err_info} on port ${port}`);
 * ```
 */
async function error(message, options) {
    await log(LogLevel.Error, message, options);
}
/**
 * Logs a message at the warn level.
 *
 * @param message
 *
 * # Examples
 *
 * ```js
 * import { warn } from '@tauri-apps/plugin-log';
 *
 * const warn_description = "Invalid Input";
 *
 * warn(`Warning! {warn_description}!`);
 * ```
 */
async function warn(message, options) {
    await log(LogLevel.Warn, message, options);
}
/**
 * Logs a message at the info level.
 *
 * @param message
 *
 * # Examples
 *
 * ```js
 * import { info } from '@tauri-apps/plugin-log';
 *
 * const conn_info = { port: 40, speed: 3.20 };
 *
 * info(`Connected to port {conn_info.port} at {conn_info.speed} Mb/s`);
 * ```
 */
async function info(message, options) {
    await log(LogLevel.Info, message, options);
}
/**
 * Logs a message at the debug level.
 *
 * @param message
 *
 * # Examples
 *
 * ```js
 * import { debug } from '@tauri-apps/plugin-log';
 *
 * const pos = { x: 3.234, y: -1.223 };
 *
 * debug(`New position: x: {pos.x}, y: {pos.y}`);
 * ```
 */
async function debug(message, options) {
    await log(LogLevel.Debug, message, options);
}
/**
 * Logs a message at the trace level.
 *
 * @param message
 *
 * # Examples
 *
 * ```js
 * import { trace } from '@tauri-apps/plugin-log';
 *
 * let pos = { x: 3.234, y: -1.223 };
 *
 * trace(`Position is: x: {pos.x}, y: {pos.y}`);
 * ```
 */
async function trace(message, options) {
    await log(LogLevel.Trace, message, options);
}
async function attachConsole() {
    return await event.listen("log://log", (event) => {
        const payload = event.payload;
        // Strip ANSI escape codes
        const message = payload.message.replace(
        // TODO: Investigate security/detect-unsafe-regex
        // eslint-disable-next-line no-control-regex, security/detect-unsafe-regex
        /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, "");
        switch (payload.level) {
            case LogLevel.Trace:
                console.log(message);
                break;
            case LogLevel.Debug:
                console.debug(message);
                break;
            case LogLevel.Info:
                console.info(message);
                break;
            case LogLevel.Warn:
                console.warn(message);
                break;
            case LogLevel.Error:
                console.error(message);
                break;
            default:
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                throw new Error(`unknown log level ${payload.level}`);
        }
    });
}

exports.attachConsole = attachConsole;
exports.debug = debug;
exports.error = error;
exports.info = info;
exports.trace = trace;
exports.warn = warn;
