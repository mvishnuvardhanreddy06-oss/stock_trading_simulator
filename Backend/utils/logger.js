const isProd = process.env.NODE_ENV === "production";

function log(...args) {
  if (!isProd) console.log(...args);
}

function info(...args) {
  console.info(...args);
}

function warn(...args) {
  console.warn(...args);
}

function error(...args) {
  console.error(...args);
}

export default { log, info, warn, error };
