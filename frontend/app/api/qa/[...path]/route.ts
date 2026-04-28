import { NextRequest, NextResponse } from "next/server";

const QA_SERVICE_URL = process.env.QA_SERVICE_URL || "http://localhost:8194";

type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

async function proxyQaRequest(request: NextRequest, context: RouteContext) {
  try {
    const { path } = await context.params;
    const targetUrl = new URL(`/api/qa/${path.join("/")}`, QA_SERVICE_URL);
    targetUrl.search = request.nextUrl.search;

    const headers = new Headers(request.headers);
    headers.delete("host");

    const response = await fetch(targetUrl.toString(), {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.text(),
      cache: "no-store",
    });

    const body = await response.text();

    return new NextResponse(body, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      { message: "Q&A service is unavailable. Start qa-service on port 8194 and try again." },
      { status: 503 }
    );
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  return proxyQaRequest(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return proxyQaRequest(request, context);
}
