import axe from "axe-core";
import { chromium } from "playwright-core";

const baseUrl = process.env.RAMA_WEB_URL ?? "http://localhost:3000";
const apiUrl = process.env.RAMA_API_URL ?? "http://localhost:4000/api/v1";
const executablePath = process.env.RAMA_CHROME_PATH ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const browser = await chromium.launch({ executablePath, headless: true });
const browserHeaders = [];
const results = [];
const customerApiHeaders = { "content-type": "application/json", "x-rama-role": "customer", "x-rama-user": "dev-customer-01" };
const advisorApiHeaders = { "content-type": "application/json", "x-rama-role": "advisor", "x-rama-user": "dev-advisor-01" };

async function api(path, { method = "GET", body, headers = customerApiHeaders, allowFailure = false } = {}) {
  const response = await fetch(`${apiUrl}/${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  if (!allowFailure && !response.ok) throw new Error(`${method} ${path} returned ${response.status}`);
  return { status: response.status, data: response.headers.get("content-type")?.includes("json") ? await response.json() : null };
}

async function prepareCustomer() {
  let briefs = (await api("briefs/mine")).data.items;
  let brief = briefs.find((item) => item.status === "submitted");
  if (!brief) {
    const input = { locale: "en", householdSize: 3, childrenCount: 1, purchasePurpose: "primary_home", moveTimeframe: "3_6_months", maxPurchasePriceAed: 4_200_000, availableCashAed: 1_300_000, financingNeeded: true, comfortableMonthlyPaymentAed: 24_000, minBedrooms: 2, preferredCommunities: ["Dubai Marina", "Downtown Dubai"], tenurePreference: "either", priorities: ["step_free_access", "commute", "quiet_home"], accessibility: { stepFreeAccess: true, liftAccess: true, wheelchairBathroom: false, lowSensoryEnvironment: true }, consent: { processingAccepted: true, advisorContactAllowed: false, anonymousAnalyticsAllowed: false } };
    const created = (await api("briefs", { method: "POST", body: { input } })).data;
    brief = (await api(`briefs/${created.id}/submit`, { method: "POST", body: { expectedVersion: created.version } })).data;
  }
  if (brief.input.consent.advisorContactAllowed) {
    brief = (await api("privacy/advisor-consent/withdraw", { method: "POST", body: { briefId: brief.id, expectedBriefVersion: brief.version, anonymousAnalyticsAllowed: brief.input.consent.anonymousAnalyticsAllowed } })).data.brief;
  }
  const cases = (await api("decision-cases/mine")).data.items;
  const active = cases.find((item) => item.status === "requested" || item.status === "assigned");
  if (active) await api(`decision-cases/${active.id}/cancel`, { method: "POST", body: { expectedVersion: active.version, reason: "privacy_preference" } });
  const shortlistResponse = (await api("shortlists/mine")).data;
  if (!shortlistResponse.shortlist?.propertySlugs?.length) {
    await api("shortlists/mine", { method: "PUT", body: { expectedVersion: shortlistResponse.shortlist?.version ?? null, propertySlugs: ["residence-1204", "marina-home-demo"] } });
  }
}

function observe(page) {
  page.on("request", (request) => {
    if (request.method() !== "GET" && request.url().startsWith(baseUrl)) {
      const headers = request.headers();
      browserHeaders.push({
        authorization: headers.authorization ?? null,
        method: request.method(),
        role: headers["x-rama-role"] ?? null,
        url: request.url(),
        user: headers["x-rama-user"] ?? null,
      });
    }
  });
}

async function scan(page, name) {
  await page.addScriptTag({ content: axe.source });
  const axeResult = await page.evaluate(async () => window.axe.run(document, {
    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] },
  }));
  const layout = await page.evaluate(() => ({
    dir: document.querySelector(".handoffApp, .advisorOpsApp")?.getAttribute("dir"),
    lang: document.querySelector(".handoffApp, .advisorOpsApp")?.getAttribute("lang"),
    overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth,
  }));
  results.push({ name, violations: axeResult.violations.map(({ id, impact, nodes }) => ({ id, impact, nodes: nodes.map((node) => ({ target: node.target, summary: node.failureSummary })) })), ...layout });
}

try {
  await prepareCustomer();
  const customer = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  observe(customer);
  await customer.goto(`${baseUrl}/en/advisor`, { waitUntil: "networkidle" });
  await customer.getByRole("heading", { name: "Move from comparison to an accountable next step." }).waitFor();
  await scan(customer, "customer-en-desktop");
  await customer.getByRole("checkbox", { name: /I allow RAMA/ }).check();
  await customer.getByRole("button", { name: "Request advisor" }).click();
  await customer.getByRole("heading", { name: "Active advisor case" }).waitFor();

  const advisor = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  observe(advisor);
  await advisor.goto(`${baseUrl}/en/advisor/cases`, { waitUntil: "networkidle" });
  await advisor.getByRole("heading", { name: "Turn customer intent into a documented response." }).waitFor();
  await advisor.getByRole("heading", { name: "Minimized customer context" }).waitFor();
  await scan(advisor, "advisor-en-desktop");
  const requestedQueue = (await api("advisor/cases/queue", { headers: advisorApiHeaders })).data;
  const requestedCase = requestedQueue.items[0];
  const advisorContext = (await api(`advisor/cases/${requestedCase.id}/context`, { headers: advisorApiHeaders })).data;
  await advisor.getByRole("button", { name: /Claim case/ }).click();
  await advisor.getByText("Case assigned to you.").waitFor();

  await customer.reload({ waitUntil: "networkidle" });
  await customer.getByText("Advisor assigned", { exact: true }).waitFor();

  const customerArabic = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await customerArabic.goto(`${baseUrl}/ar/advisor`, { waitUntil: "networkidle" });
  await scan(customerArabic, "customer-ar-mobile");

  const advisorArabic = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await advisorArabic.goto(`${baseUrl}/ar/advisor/cases`, { waitUntil: "networkidle" });
  await scan(advisorArabic, "advisor-ar-mobile");

  await customer.getByRole("button", { name: "Withdraw consent" }).click();
  await customer.getByText("Advisor-contact consent was withdrawn and any active case was cancelled.").first().waitFor();
  await customer.getByRole("heading", { name: "Prepare the handoff" }).waitFor();
  const queueAfterWithdrawal = (await api("advisor/cases/queue", { headers: advisorApiHeaders })).data;
  const staleContext = await api(`advisor/cases/${requestedCase.id}/context`, { headers: advisorApiHeaders, allowFailure: true });
  const serializedAdvisorBoundary = JSON.stringify({ requestedCase, advisorContext });
  const forbiddenAdvisorFields = ["ownerSubject", "advisorId", "actorId", "availableCashAed", "comfortableMonthlyPaymentAed", "householdSize", "childrenCount"].filter((field) => serializedAdvisorBoundary.includes(`\"${field}\"`));

  const leaked = browserHeaders.filter((request) => request.authorization || request.role || request.user);
  const violations = results.flatMap((result) => result.violations.map((violation) => ({ route: result.name, ...violation })));
  const overflow = results.filter((result) => result.overflow > 0);
  const rtlFailures = results.filter((result) => result.name.includes("-ar-") && result.dir !== "rtl");
  console.log(JSON.stringify({ browserMutations: browserHeaders, forbiddenAdvisorFields, leakedIdentityHeaders: leaked, queueAfterWithdrawal: queueAfterWithdrawal.items.length, staleContextStatus: staleContext.status, results }, null, 2));
  if (violations.length || overflow.length || rtlFailures.length || leaked.length || forbiddenAdvisorFields.length || queueAfterWithdrawal.items.length || staleContext.status !== 404) process.exitCode = 1;
} finally {
  await browser.close();
}
