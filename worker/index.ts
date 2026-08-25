/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/council-documents/") && url.pathname.endsWith(".pdf")) {
      const relativePath = url.pathname.slice("/council-documents/".length);
      const safePath = relativePath
        .split("/")
        .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
        .join("/");
      const sourceUrl = new URL(
        `/official-documents/${safePath}`,
        "https://documents.beaumontintelligence.com",
      );
      const sourceHeaders = new Headers();
      const range = request.headers.get("range");
      if (range) sourceHeaders.set("range", range);
      const source = await fetch(sourceUrl, { headers: sourceHeaders });
      const headers = new Headers({
        "content-type": source.headers.get("content-type") ?? "application/pdf",
        "cache-control": "public, max-age=86400",
        "content-disposition": `inline; filename="${relativePath.split("/").pop()?.replace(/["\\]/g, "") ?? "document.pdf"}"`,
        "x-content-type-options": "nosniff",
      });
      for (const name of ["accept-ranges", "content-length", "content-range", "etag", "last-modified"]) {
        const value = source.headers.get(name);
        if (value) headers.set(name, value);
      }
      return new Response(source.body, { status: source.status, headers });
    }

    const pdDocuments: Record<string, string> = {
      "/pd-documents/flock-2023-staff-report.pdf": "https://documents.beaumontintelligence.com/official-documents/2023-05-02/d-7-staff-report-flock-encroachment-agreement.pdf",
      "/pd-documents/flock-2024-staff-report.pdf": "https://documents.beaumontintelligence.com/official-documents/2024-08-20/j-5-staff-report-flock-camera-expansion.pdf",
      "/pd-documents/axon-2025-staff-report.pdf": "https://documents.beaumontintelligence.com/official-documents/2025-12-02/j-4-staff-report-axon-technology-agreement.pdf",
      "/pd-documents/drone-2026-staff-report.pdf": "https://documents.beaumontintelligence.com/official-documents/2026-04-07/j-9-staff-report-drone-as-first-responder.pdf",
      "/pd-documents/peregrine-2026-agenda-package.pdf": "https://documents.beaumontintelligence.com/official-documents/2026-08-04/august-4-2026-city-council-agenda-package.pdf",
      "/pd-documents/bpd-policy-manual.pdf": "https://www.beaumontca.gov/DocumentCenter/View/37037/Beaumont-Police-Department-Policy-PDF",
      "/pd-documents/drone-inventory-2025.pdf": "https://www.beaumontca.gov/DocumentCenter/View/39570/AB-481-Report-March-2025",
    };
    const pdDocumentUrl = pdDocuments[url.pathname];
    if (pdDocumentUrl) {
      const sourceHeaders = new Headers();
      const range = request.headers.get("range");
      if (range) sourceHeaders.set("range", range);
      const source = await fetch(pdDocumentUrl, { headers: sourceHeaders });
      const headers = new Headers({
        "content-type": source.headers.get("content-type") ?? "application/pdf",
        "cache-control": "public, max-age=86400",
        "content-disposition": `inline; filename="${url.pathname.split("/").pop()?.replace(/["\\]/g, "") ?? "document.pdf"}"`,
        "x-content-type-options": "nosniff",
      });
      for (const name of ["accept-ranges", "content-length", "content-range", "etag", "last-modified"]) {
        const value = source.headers.get(name);
        if (value) headers.set(name, value);
      }
      return new Response(source.body, { status: source.status, headers });
    }

    const councilIntelligencePage =
      url.pathname === "/council-intelligence.html" ||
      url.pathname === "/council-briefings.html" ||
      url.pathname === "/council-briefings-2026.html" ||
      url.pathname === "/documents/index.html" ||
      url.pathname === "/documents/viewer.html" ||
      url.pathname === "/pd-source-viewer.html" ||
      /^\/briefings\/\d{4}-\d{2}-\d{2}\.html$/.test(url.pathname);

    if (councilIntelligencePage) {
      return env.ASSETS.fetch(request);
    }

    if (url.pathname === "/pd-technology.html") {
      return env.ASSETS.fetch(
        new Request(new URL("/pd-technology-dossier.html", request.url), request),
      );
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    return handler.fetch(request, env, ctx);
  },
};

export default worker;
