const origin = process.argv[2] || "https://sukamuda.co.id";
const checks = [
  ["/", "text/html"],
  ["/ads.txt", "text/plain"],
  ["/robots.txt", "text/plain"],
  ["/sitemap.xml", "xml"],
  ["/about", "text/html"],
  ["/privacy", "text/html"],
  ["/article/gentalks-x-pleazurecc", "text/html"],
];
let failed = false;
for (const [path, expectedType] of checks) {
  try {
    const response = await fetch(origin + path, { redirect: "follow", headers: { "user-agent": "Googlebot/2.1 (+http://www.google.com/bot.html)" } });
    const type = response.headers.get("content-type") || "";
    const body = await response.text();
    const ok = response.status === 200 && type.includes(expectedType) && body.trim().length > 0;
    console.log(`${ok ? "PASS" : "FAIL"} ${path} status=${response.status} type=${type} bytes=${body.length}`);
    if (!ok) failed = true;
  } catch (error) {
    failed = true;
    console.log(`FAIL ${path} ${error.message}`);
  }
}
process.exitCode = failed ? 1 : 0;
