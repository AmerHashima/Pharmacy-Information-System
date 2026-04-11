import type { Handler, HandlerEvent } from "@netlify/functions";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PRESCRIPTION_API = "http://50.6.228.16:8000";

/**
 * Proxy for the prescription analysis API.
 * Forwards the multipart/form-data body as-is (binary) to the ML backend,
 * so the frontend on HTTPS never makes a direct HTTP request.
 */
export const handler: Handler = async (event: HandlerEvent) => {
  // Handle preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: { ...CORS_HEADERS, "Content-Length": "0" },
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Method Not Allowed" }),
    };
  }

  try {
    // Reconstruct the binary body from base64
    const bodyBuffer = event.isBase64Encoded
      ? Buffer.from(event.body!, "base64")
      : Buffer.from(event.body!, "utf-8");

    const res = await fetch(`${PRESCRIPTION_API}/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": event.headers["content-type"] || "application/octet-stream",
      },
      body: bodyBuffer,
    });

    const contentType = res.headers.get("content-type") ?? "application/json";
    const responseBody = await res.text();

    return {
      statusCode: res.status,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": contentType,
      },
      body: responseBody,
    };
  } catch (e: any) {
    console.error("[prescription-proxy] error:", e?.message);
    return {
      statusCode: 502,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: e?.message ?? "Proxy error" }),
    };
  }
};
