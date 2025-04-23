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

export function debugLog(level: LogLevel, ...args: unknown[]): void {
    if (import.meta.env.NODE_ENV !== 'development') {
        return;
    }

    const now = new Date();
    const timestamp = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

    if (isBrowser()) {
        const timestampStyle = "color: gray;";
        const levelStyle = logLevelStyles[level] || "color: white;";
        console.log(`%c[${timestamp}]%c [${level}]`, timestampStyle, levelStyle, ...args);
    } else {
        const color = logLevelColors[level] || COLORS.fg.white;
        const reset = COLORS.reset;
        const prefix = `${COLORS.fg.gray}[${timestamp}]${reset} ${color}[${level}]${reset}`;
        console.log(prefix, ...args);
    }
}

