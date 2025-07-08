import log from "loglevel";
import { useMemo } from "react";

const isProd = process.env.ENV == "production";

export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}

export interface Logger {
  debug: (message: string, ...meta: any[]) => void;
  info: (message: string, ...meta: any[]) => void;
  warn: (message: string, ...meta: any[]) => void;
  error: (message: string, ...meta: any[]) => void;
}

const useLog = (scope = "default") => {
  const _logger = useMemo(() => {
    const _logger = log.getLogger("base");
    _logger.setLevel(isProd ? LogLevel.WARN : LogLevel.DEBUG);
    return _logger;
  }, []);

  const logger: Logger = useMemo(
    () => ({
      debug: (msg: string) => _logger.debug(`[${scope}] ${msg}`),
      info: (msg: string) => _logger.info(`[${scope}] ${msg}`),
      warn: (msg: string) => _logger.warn(`[${scope}] ${msg}`),
      error: (msg: string) => _logger.error(`[${scope}] ${msg}`),
    }),
    [scope],
  );

  const setLogLevel = (level: LogLevel) => {
    _logger.setLevel(level);
  };

  return { log: logger, setLogLevel };
};

export default useLog;
