import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

export const prerender = false;

type Submission = {
  id: string;
  submittedAt: string;
  name: string;
  email: string;
  organization: string;
  role: string;
  interest: string;
  focus: string;
  timeline: string;
  mission: string;
  sourcePath: string;
  referrer: string;
  userAgent: string;
  cfCountry: string;
  cfRegion: string;
  cfCity: string;
  privacyAcknowledged: string;
  eligibilityAcknowledged: string;
};

type DatabaseStatement = {
  bind: (...values: string[]) => { run: () => Promise<unknown> };
  run: () => Promise<unknown>;
};

type Database = {
  prepare: (query: string) => DatabaseStatement;
};

const RESTRICTED_COUNTRIES = new Set(["CN", "PK"]);

function normalizeValue(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function readCfText(value: unknown) {
  return typeof value === "string" ? value : "";
}

async function saveSubmission(submission: Submission) {
  const runtimeEnv = env as Record<string, unknown>;
  const database = runtimeEnv.MIAR_WAITLIST_DB as Database | undefined;
  const kv = runtimeEnv.MIAR_WAITLIST as
    | { put: (key: string, value: string) => Promise<unknown> }
    | undefined;

  if (database && typeof database.prepare === "function") {
    await ensureWaitlistSchema(database);

    await database.prepare(
      `
      INSERT INTO waitlist_submissions (
        id,
        submitted_at,
        name,
        email,
        organization,
        role,
        interest,
        focus,
        timeline,
        mission,
        source_path,
        referrer,
        user_agent,
        cf_country,
        cf_region,
        cf_city,
        privacy_acknowledged,
        eligibility_acknowledged
      )
      VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18)
      `
    )
      .bind(
        submission.id,
        submission.submittedAt,
        submission.name,
        submission.email,
        submission.organization,
        submission.role,
        submission.interest,
        submission.focus,
        submission.timeline,
        submission.mission,
        submission.sourcePath,
        submission.referrer,
        submission.userAgent,
        submission.cfCountry,
        submission.cfRegion,
        submission.cfCity,
        submission.privacyAcknowledged,
        submission.eligibilityAcknowledged
      )
      .run();

    return "d1";
  }

  if (kv && typeof kv.put === "function") {
    await kv.put(submission.id, JSON.stringify(submission));
    return "kv";
  }

  console.log("MIAR waitlist submission", submission);
  return "log";
}

function buildHtmlResponse(message: string) {
  return `<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>MIAR request recorded</title>
      <style>
        body {
          margin: 0;
          min-height: 100vh;
          display: grid;
          place-items: center;
          background: linear-gradient(180deg, #06101d, #0a1b30);
          color: #eef7ff;
          font-family: "Helvetica Neue", Arial, sans-serif;
        }
        .card {
          max-width: 36rem;
          padding: 2rem;
          border: 1px solid rgba(178, 210, 255, 0.18);
          background: rgba(10, 24, 46, 0.82);
        }
        a { color: #7bf7ff; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>Request recorded.</h1>
        <p>${message}</p>
        <p><a href="/">Return to MIAR</a></p>
      </div>
    </body>
  </html>`;
}

async function runOptionalSchemaUpdate(database: Database, query: string) {
  try {
    await database.prepare(query).run();
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : "";

    if (!message.includes("duplicate column name")) {
      throw error;
    }
  }
}

async function ensureWaitlistSchema(database: Database) {
  await database.prepare(
    `
    CREATE TABLE IF NOT EXISTS waitlist_submissions (
      id TEXT PRIMARY KEY,
      submitted_at TEXT NOT NULL,
      name TEXT,
      email TEXT NOT NULL,
      organization TEXT,
      role TEXT,
      interest TEXT NOT NULL,
      focus TEXT NOT NULL,
      timeline TEXT,
      mission TEXT,
      source_path TEXT,
      referrer TEXT,
      user_agent TEXT,
      cf_country TEXT,
      cf_region TEXT,
      cf_city TEXT,
      privacy_acknowledged INTEGER NOT NULL DEFAULT 0,
      eligibility_acknowledged INTEGER NOT NULL DEFAULT 0
    )
    `
  ).run();

  await runOptionalSchemaUpdate(
    database,
    "ALTER TABLE waitlist_submissions ADD COLUMN privacy_acknowledged INTEGER NOT NULL DEFAULT 0"
  );
  await runOptionalSchemaUpdate(
    database,
    "ALTER TABLE waitlist_submissions ADD COLUMN eligibility_acknowledged INTEGER NOT NULL DEFAULT 0"
  );
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();

    if (normalizeValue(formData.get("website"))) {
      return Response.json({ ok: true, message: "Request recorded." });
    }

    const requestWithCf = request as Request & {
      cf?: {
        city?: string;
        country?: string;
        region?: string;
      };
    };
    const requestUrl = new URL(request.url);
    const cfCountry = readCfText(requestWithCf.cf?.country).toUpperCase();

    if (RESTRICTED_COUNTRIES.has(cfCountry)) {
      return Response.json(
        { error: "Access requests are not accepted from your jurisdiction." },
        { status: 403 }
      );
    }

    const submission: Submission = {
      id: crypto.randomUUID(),
      submittedAt: new Date().toISOString(),
      name: normalizeValue(formData.get("name")),
      email: normalizeValue(formData.get("email")).toLowerCase(),
      organization: normalizeValue(formData.get("organization")),
      role: normalizeValue(formData.get("role")),
      interest: normalizeValue(formData.get("interest")),
      focus: normalizeValue(formData.get("focus")),
      timeline: normalizeValue(formData.get("timeline")),
      mission: normalizeValue(formData.get("mission")),
      sourcePath: requestUrl.pathname,
      referrer: request.headers.get("referer") || "",
      userAgent: request.headers.get("user-agent") || "",
      cfCountry,
      cfRegion: readCfText(requestWithCf.cf?.region),
      cfCity: readCfText(requestWithCf.cf?.city),
      privacyAcknowledged: "1",
      eligibilityAcknowledged: "1",
    };

    if (!submission.email) {
      return Response.json({ error: "Work email is required." }, { status: 400 });
    }

    if (!submission.interest) {
      return Response.json({ error: "Select a primary workflow." }, { status: 400 });
    }

    if (!submission.focus) {
      return Response.json({ error: "Select an operating focus." }, { status: 400 });
    }

    const storage = await saveSubmission(submission);
    const acceptHeader = request.headers.get("accept") || "";
    const message =
      storage === "log"
        ? "Request received. Persistence is not configured in this environment yet."
        : "Request recorded. We will review fit and reach out directly where there is a clear operational match.";

    if (acceptHeader.includes("text/html")) {
      return new Response(buildHtmlResponse(message), {
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }

    return Response.json({
      ok: true,
      message,
      persisted: storage !== "log",
      storage,
    });
  } catch (error) {
    console.error("MIAR waitlist error", error);
    return Response.json({ error: "Unable to process request." }, { status: 500 });
  }
};
