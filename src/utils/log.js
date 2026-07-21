// 초경량 로거
export const log = (...a) => console.log(...a);
export const step = (msg) => console.log(`\n▶ ${msg}`);
export const ok = (msg) => console.log(`  ✔ ${msg}`);
export const warn = (msg) => console.warn(`  ⚠ ${msg}`);
export function die(msg) {
  console.error(`\n✖ ${msg}`);
  process.exit(1);
}
