type LogLevel = "ACTION" | "SUCCESS" | "ERROR" | "INFO" | "DEBUG" | "WARN";

const COLORS = {
    reset: "\x1b[0m",
    fg: {
        black: "\x1b[30m",
        red: "\x1b[31m",
        green: "\x1b[32m",
        yellow: "\x1b[33m",
        blue: "\x1b[34m",
        magenta: "\x1b[35m",
        cyan: "\x1b[36m",
        white: "\x1b[37m",
        gray: "\x1b[90m",
    },
    bg: {
        black: "\x1b[40m",
        red: "\x1b[41m",
        green: "\x1b[42m",
        yellow: "\x1b[43m",
        blue: "\x1b[44m",
        magenta: "\x1b[45m",
        cyan: "\x1b[46m",
        white: "\x1b[47m",
    },
};

const logLevelColors = {
    ACTION: COLORS.fg.cyan,
    SUCCESS: COLORS.fg.green,
    ERROR: COLORS.fg.red,
    INFO: COLORS.fg.blue,
    DEBUG: COLORS.fg.gray,
    WARN: COLORS.fg.yellow,
};

const logLevelStyles = {
    ACTION: "color: cyan;",
    SUCCESS: "color: green;",
    ERROR: "color: red;",
    INFO: "color: lightblue;",
    DEBUG: "color: gray;",
    WARN: "color: yellow;",
};

function isBrowser(): boolean {
    return typeof window !== "undefined" && typeof window.document !== "undefined";
}

const isDev = (() => {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
        return import.meta.env.NODE_ENV;
    }
    if (typeof process !== 'undefined' && process.env) {
        return process.env.NODE_ENV === 'development';
    }
    return false;
})();

export function debugLog(level: LogLevel, ...args: unknown[]): void {
    if (!isDev && level === "DEBUG") {
        return;
    }

    const now = new Date();
    const timestamp = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

    let callerFunctionName = 'unknown';
    const err = new Error();
    if (err.stack) {
        const stackLines = err.stack.split('\n');
        if (stackLines.length >= 3) {
            const callerLine = stackLines[2];
            const match = callerLine.match(/at (\S+)/);
            if (match) {
                callerFunctionName = match[1];
            }
        }
    }

    const logFn =
        level === "ERROR"
            ? console.error
            : level === "WARN"
                ? console.warn
                : console.log;

    if (isBrowser()) {
        const timestampStyle = "color: gray;";
        const levelStyle = logLevelStyles[level] || "color: white;";
        logFn(`%c[${timestamp}]%c [${level}] (${callerFunctionName})`, timestampStyle, levelStyle, ...args);
    } else {
        const color = logLevelColors[level] || COLORS.fg.white;
        const reset = COLORS.reset;
        const prefix = `${COLORS.fg.gray}[${timestamp}]${reset} ${color}[${level}] (${callerFunctionName})${reset}`;
        logFn(prefix, ...args);
    }
}


