function normalizeValue(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

async function saveSubmission(env, submission) {
  if (env.MIAR_WAITLIST_DB && typeof env.MIAR_WAITLIST_DB.prepare === "function") {
    await env.MIAR_WAITLIST_DB.prepare(
      `
      CREATE TABLE IF NOT EXISTS waitlist_submissions (
        id TEXT PRIMARY KEY,
        submitted_at TEXT NOT NULL,
        name TEXT,
        email TEXT NOT NULL,
        organization TEXT,
        interest TEXT,
        mission TEXT
      )
      `
    ).run();

    await env.MIAR_WAITLIST_DB.prepare(
      `
      INSERT INTO waitlist_submissions (id, submitted_at, name, email, organization, interest, mission)
      VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
      `
    )
      .bind(
        submission.id,
        submission.submittedAt,
        submission.name,
        submission.email,
        submission.organization,
        submission.interest,
        submission.mission
      )
      .run();

    return "d1";
  }

  if (env.MIAR_WAITLIST && typeof env.MIAR_WAITLIST.put === "function") {
    await env.MIAR_WAITLIST.put(submission.id, JSON.stringify(submission));
    return "kv";
  }

  console.log("MIAR waitlist submission", submission);
  return "log";
}

function buildHtmlResponse(message) {
  return `<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>MIAR waitlist</title>
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
          max-width: 34rem;
          padding: 2rem;
          border-radius: 1.25rem;
          background: rgba(10, 24, 46, 0.82);
          border: 1px solid rgba(178, 210, 255, 0.18);
        }
        a { color: #7bf7ff; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>Request received.</h1>
        <p>${message}</p>
        <p><a href="/">Return to MIAR</a></p>
      </div>
    </body>
  </html>`;
}

export async function onRequestPost(context) {
  try {
    const formData = await context.request.formData();

    const submission = {
      id: crypto.randomUUID(),
      submittedAt: new Date().toISOString(),
      name: normalizeValue(formData.get("name")),
      email: normalizeValue(formData.get("email")).toLowerCase(),
      organization: normalizeValue(formData.get("organization")),
      interest: normalizeValue(formData.get("interest")),
      mission: normalizeValue(formData.get("mission")),
    };

    if (!submission.email) {
      return Response.json({ error: "Email is required." }, { status: 400 });
    }

    const storage = await saveSubmission(context.env, submission);
    const acceptHeader = context.request.headers.get("accept") || "";
    const message =
      storage === "log"
        ? "Your request has been accepted by the MIAR waitlist endpoint."
        : "Your request has been stored successfully.";

    if (acceptHeader.includes("text/html")) {
      return new Response(buildHtmlResponse(message), {
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }

    return Response.json({
      ok: true,
      message: "Request received. MIAR will be in touch.",
      storage,
    });
  } catch (error) {
    console.error("MIAR waitlist error", error);
    return Response.json({ error: "Unable to process request." }, { status: 500 });
  }
}
