import { chromium } from "playwright";

const url = process.argv[2] ?? "http://localhost:3000";
const outPath = process.argv[3] ?? "scripts/.screenshot.png";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 1400 } });
const consoleErrors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});
page.on("pageerror", (err) => consoleErrors.push(String(err)));

await page.goto(url, { waitUntil: "networkidle" });
await page.screenshot({ path: outPath, fullPage: true });
await browser.close();

console.log(`Screenshot saved to ${outPath}`);
if (consoleErrors.length > 0) {
  console.log("Console errors:");
  for (const e of consoleErrors) console.log(" -", e);
} else {
  console.log("No console errors.");
}
