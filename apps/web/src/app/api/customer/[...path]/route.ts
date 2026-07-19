import { NextRequest, NextResponse } from "next/server";

import { CustomerSessionMissingError, getCustomerApiHeaders } from "@/lib/customer-api-auth";

export const runtime = "nodejs";

const apiUrl =
  process.env.RAMA_API_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:4000/api/v1";

const routes = [
  { method: "POST", pattern: /^briefs$/ },
  { method: "GET", pattern: /^briefs\/mine$/ },
  { method: "GET", pattern: /^briefs\/[0-9a-f-]+$/i },
  { method: "PUT", pattern: /^briefs\/[0-9a-f-]+$/i },
  { method: "POST", pattern: /^briefs\/[0-9a-f-]+\/submit$/i },
  { method: "POST", pattern: /^briefs\/[0-9a-f-]+\/consent$/i },
  { method: "GET", pattern: /^properties\/search$/ },
  { method: "POST", pattern: /^properties\/compare$/ },
  { method: "GET", pattern: /^shortlists\/mine$/ },
  { method: "PUT", pattern: /^shortlists\/mine$/ },
  { method: "GET", pattern: /^decision-cases\/mine$/ },
  { method: "POST", pattern: /^decision-cases$/ },
  { method: "POST", pattern: /^decision-cases\/[0-9a-f-]+\/cancel$/i },
  { method: "POST", pattern: /^privacy\/advisor-consent\/withdraw$/ },
  { method: "GET", pattern: /^contact-profile\/mine$/ },
  { method: "PUT", pattern: /^contact-profile\/(points|preferences)$/ },
  { method: "POST", pattern: /^contact-profile\/verification\/(request|confirm)$/ },
  { method: "GET", pattern: /^notifications\/mine$/ },
  { method: "POST", pattern: /^notifications\/[0-9a-f-]+\/read$/i },
] as const;

type RouteContext = { params: Promise<{ path: string[] }> };

const proxy = async (request: NextRequest, context: RouteContext): Promise<NextResponse> => {
  const path = (await context.params).path.join("/");
  if (!routes.some((route) => route.method === request.method && route.pattern.test(path))) {
    return NextResponse.json({ code: "CUSTOMER_ROUTE_FORBIDDEN" }, { status: 404 });
  }
  if (request.method !== "GET") {
    const origin = request.headers.get("origin");
    const fetchSite = request.headers.get("sec-fetch-site");
    const exactOrigin = origin ? new URL(origin).origin === request.nextUrl.origin : false;
    if (!exactOrigin && fetchSite !== "same-origin") {
      return NextResponse.json({ code: "CUSTOMER_ORIGIN_FORBIDDEN" }, { status: 403 });
    }
  }
  try {
    const headers = new Headers(await getCustomerApiHeaders());
    let body: string | undefined;
    if (request.method !== "GET") {
      body = await request.text();
      if (Buffer.byteLength(body, "utf8") > 262_144) {
        return NextResponse.json({ code: "CUSTOMER_BODY_TOO_LARGE" }, { status: 413 });
      }
      headers.set("content-type", "application/json");
    }
    const upstream = await fetch(`${apiUrl}/${path}${request.nextUrl.search}`, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    return new NextResponse(await upstream.arrayBuffer(), {
      status: upstream.status,
      headers: {
        "content-type": upstream.headers.get("content-type") ?? "application/json; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof CustomerSessionMissingError) {
      return NextResponse.json({ code: "CUSTOMER_SESSION_REQUIRED" }, { status: 401 });
    }
    return NextResponse.json({ code: "CUSTOMER_UPSTREAM_UNAVAILABLE" }, { status: 502 });
  }
};

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
