import { NextRequest, NextResponse } from "next/server";

import { AdvisorSessionMissingError, getAdvisorApiHeaders } from "@/lib/advisor-api-auth";

export const runtime = "nodejs";
const apiUrl = process.env.RAMA_API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000/api/v1";
const routes = [
  { method: "GET", pattern: /^advisor\/cases\/queue$/ },
  { method: "GET", pattern: /^advisor\/cases\/[0-9a-f-]+\/context$/i },
  { method: "POST", pattern: /^advisor\/cases\/[0-9a-f-]+\/(claim|close)$/i },
  { method: "POST", pattern: /^advisor\/cases\/[0-9a-f-]+\/messages$/i },
] as const;
type RouteContext = { params: Promise<{ path: string[] }> };

const proxy = async (request: NextRequest, context: RouteContext): Promise<NextResponse> => {
  const path = (await context.params).path.join("/");
  if (!routes.some((route) => route.method === request.method && route.pattern.test(path))) {
    return NextResponse.json({ code: "ADVISOR_ROUTE_FORBIDDEN" }, { status: 404 });
  }
  if (request.method !== "GET") {
    const origin = request.headers.get("origin");
    const fetchSite = request.headers.get("sec-fetch-site");
    const exactOrigin = origin ? new URL(origin).origin === request.nextUrl.origin : false;
    if (!exactOrigin && fetchSite !== "same-origin") return NextResponse.json({ code: "ADVISOR_ORIGIN_FORBIDDEN" }, { status: 403 });
  }
  try {
    const headers = new Headers(await getAdvisorApiHeaders());
    let body: string | undefined;
    if (request.method !== "GET") {
      body = await request.text();
      if (Buffer.byteLength(body, "utf8") > 262_144) return NextResponse.json({ code: "ADVISOR_BODY_TOO_LARGE" }, { status: 413 });
      headers.set("content-type", "application/json");
    }
    const upstream = await fetch(`${apiUrl}/${path}`, { method: request.method, headers, body, cache: "no-store", signal: AbortSignal.timeout(10_000) });
    return new NextResponse(await upstream.arrayBuffer(), { status: upstream.status, headers: { "content-type": upstream.headers.get("content-type") ?? "application/json; charset=utf-8", "cache-control": "no-store" } });
  } catch (error) {
    if (error instanceof AdvisorSessionMissingError) return NextResponse.json({ code: "ADVISOR_SESSION_REQUIRED" }, { status: 401 });
    return NextResponse.json({ code: "ADVISOR_UPSTREAM_UNAVAILABLE" }, { status: 502 });
  }
};

export const GET = proxy;
export const POST = proxy;
