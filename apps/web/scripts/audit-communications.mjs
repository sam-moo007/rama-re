import axe from "axe-core";
import { chromium } from "playwright-core";

const baseUrl = process.env.RAMA_WEB_URL ?? "http://localhost:3000";
const apiUrl = process.env.RAMA_API_URL ?? "http://localhost:4000/api/v1";
const executablePath = process.env.RAMA_CHROME_PATH ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const customerHeaders = { "content-type": "application/json", "x-rama-role": "customer", "x-rama-user": "dev-customer-01" };
const advisorHeaders = { "content-type": "application/json", "x-rama-role": "advisor", "x-rama-user": "dev-advisor-01" };
const contactValue = "audit.communication@example.com";
const browser = await chromium.launch({ executablePath, headless: true });
const browserMutations = [];
const protectedResponses = [];
const results = [];

async function api(path, { method = "GET", body, headers = customerHeaders } = {}) {
  const response = await fetch(`${apiUrl}/${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  if (!response.ok) throw new Error(`${method} ${path} returned ${response.status}: ${await response.text()}`);
  return response.json();
}

function observe(page) {
  page.on("request", (request) => {
    if (request.method() === "GET" || !request.url().startsWith(baseUrl)) return;
    const headers = request.headers();
    browserMutations.push({
      authorization: headers.authorization ?? null,
      method: request.method(),
      role: headers["x-rama-role"] ?? null,
      url: request.url(),
      user: headers["x-rama-user"] ?? null,
    });
  });
  page.on("response", (response) => {
    if (!/contact-profile|notifications|\/messages/.test(response.url())) return;
    protectedResponses.push(response.text().catch(() => ""));
  });
}

async function scan(page, name, root) {
  await page.addScriptTag({ content: axe.source });
  const axeResult = await page.evaluate(async () => window.axe.run(document, {
    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] },
  }));
  const layout = await page.evaluate((selector) => ({
    dir: document.querySelector(selector)?.getAttribute("dir"),
    lang: document.querySelector(selector)?.getAttribute("lang"),
    overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth,
  }), root);
  results.push({ name, violations: axeResult.violations.map(({ id, impact, nodes }) => ({ id, impact, nodes: nodes.map((node) => ({ target: node.target, summary: node.failureSummary })) })), ...layout });
}

async function prepareCase() {
  const input = { locale: "en", householdSize: 2, childrenCount: 0, purchasePurpose: "primary_home", moveTimeframe: "3_6_months", maxPurchasePriceAed: 2_000_000, availableCashAed: 600_000, financingNeeded: true, comfortableMonthlyPaymentAed: 12_000, minBedrooms: 2, preferredCommunities: ["Dubai Marina"], tenurePreference: "ready", priorities: ["commute"], accessibility: { stepFreeAccess: false, liftAccess: true, wheelchairBathroom: false, lowSensoryEnvironment: false }, consent: { processingAccepted: true, advisorContactAllowed: true, anonymousAnalyticsAllowed: false } };
  const draft = await api("briefs", { method: "POST", body: { input } });
  const brief = await api(`briefs/${draft.id}/submit`, { method: "POST", body: { expectedVersion: draft.version } });
  const currentShortlist = await api("shortlists/mine");
  const shortlist = await api("shortlists/mine", { method: "PUT", body: { expectedVersion: currentShortlist.shortlist?.version ?? null, propertySlugs: ["residence-1204"] } });
  const decisionCase = await api("decision-cases", { method: "POST", body: { briefId: brief.id, shortlistVersion: shortlist.version, propertySlugs: ["residence-1204"], reason: "property_questions", topics: ["evidence_unknowns"], preferredContactChannel: "email" } });
  return api(`advisor/cases/${decisionCase.id}/claim`, { method: "POST", headers: advisorHeaders, body: { expectedVersion: decisionCase.version } });
}

try {
  const customer = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  observe(customer);
  await customer.goto(`${baseUrl}/en/settings/contact`, { waitUntil: "networkidle" });
  await customer.getByRole("heading", { name: "Keep contact details outside the decision case." }).waitFor();
  await scan(customer, "contact-en-desktop", ".communicationsApp");
  await customer.getByLabel("Email address").fill(contactValue);
  await customer.getByRole("button", { name: "Save contact points" }).click();
  await customer.getByText("Contact points encrypted and saved.").waitFor();
  if (await customer.getByRole("button", { name: "Send code" }).count()) {
    await customer.getByRole("button", { name: "Send code" }).click();
    await customer.getByText("Development verification code").waitFor();
    await customer.getByRole("button", { name: "Confirm code" }).click();
    await customer.getByText("Contact point verified.").waitFor();
  }
  await customer.getByRole("checkbox", { name: "Email case updates" }).check();
  await customer.getByRole("button", { name: "Save preferences" }).click();
  await customer.getByText("Notification preferences updated.").waitFor();
  const customerPageText = await customer.locator("body").innerText();

  const claimed = await prepareCase();
  const advisor = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  observe(advisor);
  await advisor.goto(`${baseUrl}/en/advisor/cases`, { waitUntil: "networkidle" });
  await advisor.getByRole("heading", { name: "Send a structured update" }).waitFor();
  await scan(advisor, "advisor-message-en-desktop", ".advisorOpsApp");
  await advisor.getByRole("button", { name: "Send update" }).click();
  await advisor.getByText(/Delivery result: delivered/).waitFor();
  const advisorPageText = await advisor.locator("body").innerText();

  const inbox = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  observe(inbox);
  await inbox.goto(`${baseUrl}/en/notifications`, { waitUntil: "networkidle" });
  await inbox.getByRole("heading", { name: "A private record of every advisor update." }).waitFor();
  await inbox.getByText("Your advisor has acknowledged the case.").waitFor();
  await scan(inbox, "inbox-en-desktop", ".communicationsApp");

  const contactArabic = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await contactArabic.goto(`${baseUrl}/ar/settings/contact`, { waitUntil: "networkidle" });
  await scan(contactArabic, "contact-ar-mobile", ".communicationsApp");
  const inboxArabic = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await inboxArabic.goto(`${baseUrl}/ar/notifications`, { waitUntil: "networkidle" });
  await scan(inboxArabic, "inbox-ar-mobile", ".communicationsApp");

  const serializedResponses = (await Promise.all(protectedResponses)).join("\n");
  const forbiddenResponseFields = [contactValue, "ownerSubject", "advisorSubject", "encryptedValue", "verificationCodeHash"].filter((value) => serializedResponses.includes(value));
  const leakedIdentityHeaders = browserMutations.filter((request) => request.authorization || request.role || request.user);
  const violations = results.flatMap((result) => result.violations.map((violation) => ({ route: result.name, ...violation })));
  const overflow = results.filter((result) => result.overflow > 0);
  const rtlFailures = results.filter((result) => result.name.includes("-ar-") && result.dir !== "rtl");
  const plaintextLeaks = [customerPageText, advisorPageText].filter((text) => text.includes(contactValue)).length;
  console.log(JSON.stringify({ caseId: claimed.id, browserMutations, forbiddenResponseFields, leakedIdentityHeaders, plaintextLeaks, results }, null, 2));
  if (violations.length || overflow.length || rtlFailures.length || leakedIdentityHeaders.length || forbiddenResponseFields.length || plaintextLeaks) process.exitCode = 1;
} finally {
  await browser.close();
}
