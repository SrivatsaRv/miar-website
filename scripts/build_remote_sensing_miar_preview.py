from __future__ import annotations

import re
from pathlib import Path


ROOT = Path("/Users/one2n/miar-website")
SOURCE_HTML = ROOT / "public/whitepapers/library/remote-sensing-whitepaper.html"
OUTPUT_DIR = ROOT / ".codex-artifacts/whitepapers/remote-sensing-defense-imagery-intelligence-preview"
OUTPUT_HTML = OUTPUT_DIR / "remote-sensing-defense-imagery-intelligence-preview.html"


def extract_body(source: str) -> str:
    match = re.search(r"<body>(.*)</body>", source, flags=re.S)
    if not match:
        raise RuntimeError("Could not locate <body> in source whitepaper HTML.")

    body = match.group(1)
    body = re.sub(r"<header id=\"title-block-header\">.*?</header>", "", body, flags=re.S)
    body = re.sub(r"\s*<link rel=\"stylesheet\".*?>", "", body, flags=re.S)
    return body.strip()


def normalize_markup(body: str) -> str:
    # Remove duplicated human-written numbering that appears after Pandoc's generated section numbers.
    body = re.sub(
        r"(<a [^>]*><span[^>]*>[^<]+</span>)\s*\d+(?:\.\d+)*\.?\s*",
        r"\1 ",
        body,
        flags=re.S,
    )
    body = re.sub(
        r"(<h[1-3][^>]*>\s*<span[^>]*>[^<]+</span>)\s*\d+(?:\.\d+)*\.?\s*",
        r"\1 ",
        body,
        flags=re.S,
    )
    body = body.replace(
        "id=\"TOC\" role=\"doc-toc\"",
        "id=\"TOC\" role=\"doc-toc\" aria-label=\"Table of contents\"",
    )
    return body


def insert_visuals(body: str) -> str:
    scene_spread = """
    <section class="scene-spread" aria-label="Illustrative scene pair">
      <div class="scene-spread-copy">
        <p class="eyebrow">Illustrative AOI Sequence</p>
        <h2>Change detection becomes operational only when scene pairs remain reviewable.</h2>
        <p>
          The whitepaper argues that temporal analysis, evidence lineage, and analyst review matter as
          much as model confidence. This paired AOI visual is included as an operator-facing example,
          not as a benchmark claim.
        </p>
      </div>
      <div class="scene-spread-visual">
        <figure>
          <img src="/Users/one2n/miar-website/public/imagery/monitored-site-reference-2025.png" alt="Monitored airbase scene from 2025" />
          <figcaption>Monitored AOI, earlier scene</figcaption>
        </figure>
        <figure>
          <img src="/Users/one2n/miar-website/public/imagery/monitored-site-follow-on-2026.png" alt="Monitored airbase scene from 2026" />
          <figcaption>Monitored AOI, later scene</figcaption>
        </figure>
      </div>
    </section>
    """

    shield_callout = """
    <aside class="shield-callout">
      <p class="eyebrow">Platform Consequence</p>
      <p>
        The paper's through-line is consistent: imagery systems need governed evidence handling,
        temporal comparison, and human promotion paths. That is the boundary between model output
        and defensible intelligence.
      </p>
    </aside>
    """

    body = re.sub(
        r'(<h1[^>]*id="change-detection"[^>]*>.*?</h1>)',
        scene_spread + "\n" + r"\1",
        body,
        count=1,
        flags=re.S,
    )
    body = re.sub(
        r'(<h1[^>]*id="implications-for-shield-and-similar-platforms"[^>]*>.*?</h1>)',
        shield_callout + "\n" + r"\1",
        body,
        count=1,
        flags=re.S,
    )
    return body


def build_html(body: str) -> str:
    styles = """
    :root {
      color-scheme: dark;
      --bg: #0d1015;
      --bg-top: #121722;
      --surface: rgba(20, 24, 31, 0.9);
      --surface-strong: rgba(26, 31, 39, 0.96);
      --surface-soft: rgba(255, 255, 255, 0.04);
      --line: rgba(183, 200, 225, 0.16);
      --line-strong: rgba(183, 200, 225, 0.3);
      --text: #edf2f8;
      --muted: #c7cfda;
      --soft: #8f98a7;
      --primary: #c6d6ed;
      --warm: #dfc4a0;
      --success: #a8cfc0;
      --shadow: 0 28px 80px rgba(0, 0, 0, 0.32);
    }

    @page {
      size: A4;
      margin: 10mm 10mm 13mm;
    }

    * {
      box-sizing: border-box;
    }

    html,
    body {
      margin: 0;
      padding: 0;
      background:
        radial-gradient(circle at 12% 10%, rgba(183, 200, 225, 0.07), transparent 24%),
        radial-gradient(circle at 85% 22%, rgba(223, 196, 160, 0.05), transparent 18%),
        linear-gradient(180deg, var(--bg-top) 0%, var(--bg) 100%);
      color: var(--text);
      font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      text-rendering: optimizeLegibility;
    }

    body {
      font-size: 10.35pt;
      line-height: 1.54;
    }

    a {
      color: inherit;
      text-decoration: none;
    }

    img {
      display: block;
      max-width: 100%;
    }

    .cover-page,
    .closing-page,
    #TOC {
      break-after: page;
      page-break-after: always;
    }

    .cover-page,
    .closing-page,
    .document-shell {
      position: relative;
      width: min(1040px, calc(100% - 48px));
      margin: 24px auto;
      border: 1px solid rgba(255, 255, 255, 0.06);
      background: linear-gradient(180deg, rgba(21, 26, 34, 0.98), rgba(12, 15, 21, 0.98));
      box-shadow: var(--shadow);
      overflow: hidden;
    }

    .cover-page::before,
    .closing-page::before,
    .document-shell::before {
      content: "";
      position: absolute;
      inset: 14px;
      border: 1px solid var(--line);
      pointer-events: none;
    }

    .cover-page,
    .closing-page {
      min-height: calc(297mm - 28mm);
      padding: 32px;
    }

    .cover-page {
      display: grid;
      grid-template-rows: auto 1fr auto;
      gap: 28px;
    }

    .brandline,
    .footerline {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      color: var(--soft);
      font-size: 9pt;
      letter-spacing: 0.16em;
      text-transform: uppercase;
    }

    .brand-stack {
      display: grid;
      gap: 4px;
    }

    .brand-stack strong {
      color: var(--text);
      font-size: 10pt;
      letter-spacing: 0.18em;
    }

    .cover-grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(320px, 0.9fr);
      gap: 28px;
      align-items: start;
    }

    .eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      margin: 0 0 18px;
      color: var(--primary);
      font-size: 8.8pt;
      font-weight: 700;
      letter-spacing: 0.16em;
      text-transform: uppercase;
    }

    .eyebrow::before {
      content: "";
      width: 36px;
      height: 1px;
      background: currentColor;
    }

    h1,
    h2,
    h3,
    h4 {
      margin: 0;
      letter-spacing: -0.05em;
      line-height: 0.98;
    }

    .cover-page h1 {
      font-size: clamp(42px, 6vw, 74px);
      max-width: 560px;
    }

    .cover-subtitle {
      margin-top: 18px;
      max-width: 560px;
      color: var(--muted);
      font-size: 16px;
      line-height: 1.45;
    }

    .cover-abstract {
      margin-top: 22px;
      max-width: 560px;
      padding: 18px 20px;
      border: 1px solid var(--line);
      background: linear-gradient(180deg, rgba(24, 28, 36, 0.94), rgba(16, 19, 24, 0.98));
    }

    .cover-abstract strong {
      display: block;
      margin-bottom: 10px;
      color: var(--primary);
      font-size: 9pt;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }

    .cover-visual {
      padding: 16px;
      border: 1px solid var(--line);
      background: linear-gradient(180deg, rgba(25, 29, 37, 0.95), rgba(15, 18, 24, 0.98));
    }

    .cover-visual img {
      height: 390px;
      object-fit: cover;
      filter: saturate(0.84) brightness(0.86);
    }

    .cover-strip {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-top: 12px;
    }

    .mini-card,
    .signal-card,
    .scene-spread-copy,
    .shield-callout,
    blockquote {
      padding: 16px 18px;
      border: 1px solid var(--line);
      background: linear-gradient(180deg, rgba(29, 33, 40, 0.92), rgba(18, 21, 26, 0.96));
    }

    .mini-card span {
      display: block;
      color: var(--soft);
      font-size: 8pt;
      font-weight: 700;
      letter-spacing: 0.13em;
      text-transform: uppercase;
    }

    .mini-card strong {
      display: block;
      margin-top: 8px;
      font-size: 16px;
      line-height: 1.2;
    }

    .document-shell {
      padding: 28px 34px 38px;
    }

    .document-shell article {
      position: relative;
      z-index: 1;
    }

    #TOC {
      margin: 0 0 34px;
      padding: 18px 20px;
      border: 1px solid var(--line);
      background: linear-gradient(180deg, rgba(19, 23, 30, 0.95), rgba(14, 17, 22, 0.98));
    }

    #TOC::before {
      content: "Contents";
      display: block;
      margin-bottom: 18px;
      color: var(--primary);
      font-size: 9pt;
      font-weight: 700;
      letter-spacing: 0.16em;
      text-transform: uppercase;
    }

    #TOC ul {
      margin: 0;
      padding-left: 16px;
    }

    #TOC > ul {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px 26px;
      padding-left: 18px;
    }

    #TOC > ul > li {
      margin: 0;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    #TOC li {
      margin: 0 0 4px;
      color: var(--muted);
      font-size: 9.2pt;
      line-height: 1.42;
    }

    #TOC > ul > li > ul {
      margin-top: 6px;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 4px 14px;
      padding-left: 18px;
    }

    #TOC > ul > li > ul > li > ul {
      margin-top: 4px;
      display: block;
      padding-left: 16px;
    }

    #TOC a {
      color: inherit;
    }

    .whitepaper-body > h1:first-of-type {
      margin-top: 0;
    }

    h1 {
      display: flex;
      align-items: center;
      gap: 14px;
      margin: 30px 0 12px;
      padding-top: 8px;
      border-top: 1px solid var(--line-strong);
      font-size: 28px;
      page-break-after: avoid;
      break-after: avoid;
    }

    h1::after {
      content: "";
      flex: 1 1 auto;
      height: 1px;
      background: linear-gradient(90deg, rgba(183, 200, 225, 0.18), rgba(183, 200, 225, 0));
    }

    h2 {
      margin: 22px 0 8px;
      color: var(--text);
      font-size: 18px;
      page-break-after: avoid;
      break-after: avoid;
    }

    h3 {
      margin: 18px 0 6px;
      color: var(--primary);
      font-size: 14px;
      letter-spacing: 0.02em;
      line-height: 1.22;
      page-break-after: avoid;
      break-after: avoid;
    }

    p,
    li,
    td,
    th,
    code {
      color: var(--muted);
      font-size: 10.35pt;
      line-height: 1.54;
    }

    p {
      margin: 0 0 11px;
    }

    ul,
    ol {
      margin: 0 0 11px;
      padding-left: 20px;
    }

    li + li {
      margin-top: 4px;
    }

    strong,
    b {
      color: var(--text);
    }

    code {
      padding: 2px 8px;
      border: 1px solid var(--line);
      background: rgba(255, 255, 255, 0.03);
      font-family: "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", monospace;
      font-size: 10pt;
    }

    table {
      width: 100%;
      margin: 14px 0 18px;
      border-collapse: collapse;
      border: 1px solid var(--line);
      background: rgba(255, 255, 255, 0.02);
      break-inside: avoid;
      page-break-inside: avoid;
    }

    th,
    td {
      padding: 10px 12px;
      border: 1px solid var(--line);
      vertical-align: top;
      text-align: left;
    }

    th {
      color: var(--text);
      background: rgba(198, 214, 237, 0.08);
    }

    blockquote {
      margin: 22px 0;
    }

    .header-section-number,
    .toc-section-number {
      color: var(--primary);
      font-weight: 700;
      letter-spacing: 0.03em;
    }

    h1 > .header-section-number {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 34px;
      padding: 5px 8px;
      border: 1px solid var(--line);
      background: rgba(198, 214, 237, 0.06);
      font-size: 11px;
      line-height: 1;
      border-radius: 999px;
    }

    h2 > .header-section-number,
    h3 > .header-section-number {
      margin-right: 8px;
      color: var(--soft);
      font-size: 0.82em;
    }

    .scene-spread {
      display: grid;
      grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
      gap: 20px;
      margin: 28px 0 20px;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .scene-spread-copy h2 {
      margin: 0 0 14px;
      font-size: 28px;
    }

    .scene-spread-visual {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .scene-spread-visual figure {
      margin: 0;
      padding: 12px;
      border: 1px solid var(--line);
      background: linear-gradient(180deg, rgba(23, 27, 34, 0.95), rgba(15, 18, 23, 0.98));
    }

    .scene-spread-visual img {
      width: 100%;
      height: 250px;
      object-fit: cover;
      filter: saturate(0.86) brightness(0.88);
    }

    figcaption {
      margin-top: 10px;
      color: var(--soft);
      font-size: 8.8pt;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .shield-callout {
      margin: 26px 0 14px;
      break-inside: avoid;
    }

    .whitepaper-body > h1:not(:first-of-type) {
      margin-top: 34px;
    }

    .whitepaper-body > h1 + p,
    .whitepaper-body > h2 + p,
    .whitepaper-body > h3 + p {
      break-before: avoid;
    }

    .whitepaper-body {
      orphans: 3;
      widows: 3;
    }

    .closing-page {
      display: grid;
      grid-template-rows: auto 1fr auto;
      gap: 26px;
    }

    .closing-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.95fr);
      gap: 26px;
      align-items: end;
    }

    .closing-page h2 {
      font-size: clamp(36px, 5vw, 56px);
      max-width: 560px;
    }

    .closing-copy p {
      max-width: 520px;
      font-size: 14px;
      line-height: 1.55;
    }

    .signal-grid {
      display: grid;
      gap: 12px;
    }

    .signal-card strong {
      display: block;
      margin-bottom: 8px;
      color: var(--text);
      font-size: 15px;
      line-height: 1.25;
    }

    .signal-card span {
      color: var(--soft);
      font-size: 8pt;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }

    .cta-panel {
      padding: 18px 20px;
      border: 1px solid var(--line-strong);
      background: linear-gradient(180deg, rgba(28, 32, 41, 0.96), rgba(17, 20, 26, 0.98));
    }

    .cta-panel strong {
      display: block;
      margin-bottom: 10px;
      color: var(--primary);
      font-size: 9pt;
      letter-spacing: 0.16em;
      text-transform: uppercase;
    }

    .cta-link {
      display: block;
      margin-top: 8px;
      color: var(--text);
      font-size: 26px;
      font-weight: 700;
      letter-spacing: -0.03em;
    }

    .cta-subline {
      margin-top: 10px;
      color: var(--muted);
      font-size: 13px;
      line-height: 1.5;
    }

    .closing-visual img {
      height: 360px;
      object-fit: cover;
      filter: saturate(0.88) brightness(0.86);
      border: 1px solid var(--line);
    }

    @media screen {
      body {
        padding: 24px 0 36px;
      }
    }

    @media print {
      body {
        padding: 0;
      }

      .cover-page,
      .closing-page,
      .document-shell {
        width: auto;
        margin: 0;
        box-shadow: none;
      }
    }
    """

    return f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Remote Sensing for Defense Imagery Intelligence | MIAR</title>
    <style>{styles}</style>
  </head>
  <body>
    <section class="cover-page">
      <div class="brandline">
        <div class="brand-stack">
          <strong>MIAR</strong>
          <span>By ReachDefence</span>
        </div>
        <span>Prepared for MIAR and Project Shield</span>
      </div>

      <div class="cover-grid">
        <div class="cover-copy">
          <p class="eyebrow">Whitepaper Preview</p>
          <h1>Remote Sensing for Defense Imagery Intelligence</h1>
          <p class="cover-subtitle">
            A MIAR-branded editorial rendering of the source whitepaper on satellite imagery,
            commercial Earth observation markets, change detection, and overhead object recognition.
          </p>
          <div class="cover-abstract">
            <strong>Abstract</strong>
            <p>
              This whitepaper explains the subject matter required to build serious defense imagery
              intelligence capabilities. It covers the sensor landscape, commercial and public Earth
              observation systems, archive and tasking business models, change-detection workflows,
              overhead object detection, fine-grained aircraft recognition, and the evidence-handling
              implications for platforms such as SHIELD.
            </p>
          </div>
        </div>

        <div class="cover-visual">
          <img src="/Users/one2n/miar-website/public/imagery/monitored-site-follow-on-2026.png" alt="Monitored airbase imagery" />
          <div class="cover-strip">
            <div class="mini-card">
              <span>Focus</span>
              <strong>Sensor literacy and market literacy</strong>
            </div>
            <div class="mini-card">
              <span>Priority</span>
              <strong>Temporal analysis and change detection</strong>
            </div>
            <div class="mini-card">
              <span>Boundary</span>
              <strong>Evidence before intelligence truth</strong>
            </div>
          </div>
        </div>
      </div>

      <div class="footerline">
        <span>2026-05-12 Source Draft</span>
        <span>miar.reachdefence.com</span>
      </div>
    </section>

    <main class="document-shell">
      <article class="whitepaper-body">
        {body}
      </article>
    </main>

    <section class="closing-page">
      <div class="brandline">
        <div class="brand-stack">
          <strong>ReachDefence</strong>
          <span>MIAR Publication</span>
        </div>
        <span>Operational Imagery Intelligence</span>
      </div>

      <div class="closing-grid">
        <div class="closing-copy">
          <p class="eyebrow">Next Step</p>
          <h2>Turn imagery into governed, decision-ready evidence.</h2>
          <p>
            MIAR is positioned around the operational stack this paper describes: multi-provider
            imagery intake, temporal comparison, analyst review, and controlled promotion of
            machine outputs into usable intelligence workflows.
          </p>
          <div class="cta-panel">
            <strong>Request Access</strong>
            <a class="cta-link" href="https://miar.reachdefence.com">miar.reachdefence.com</a>
            <p class="cta-subline">
              For product evaluation, platform access, and follow-up on imagery intelligence
              workflows, use the MIAR request flow on the public site.
            </p>
          </div>
        </div>

        <div class="closing-visual">
          <img src="/Users/one2n/miar-website/public/imagery/monitored-site-reference-2025.png" alt="Monitored airbase earlier imagery" />
        </div>
      </div>

      <div class="signal-grid">
        <div class="signal-card">
          <span>Operator Value</span>
          <strong>Evidence-linked monitoring across recurring AOIs</strong>
          <p>Scene identity, change interpretation, and review state remain traceable through the workflow.</p>
        </div>
        <div class="signal-card">
          <span>Workbench Thesis</span>
          <strong>Vendor-agnostic in collection. Opinionated in intelligence.</strong>
          <p>The goal is not another ordering console. The goal is mission-window answers built on governed evidence.</p>
        </div>
      </div>
    </section>
  </body>
</html>
"""


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    source = SOURCE_HTML.read_text()
    body = extract_body(source)
    body = normalize_markup(body)
    body = insert_visuals(body)
    OUTPUT_HTML.write_text(build_html(body))
    print(OUTPUT_HTML)


if __name__ == "__main__":
    main()
