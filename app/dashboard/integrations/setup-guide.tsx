"use client";

import { useState } from "react";

// Click-to-connect setup helper shown when an OAuth provider isn't configured.
// Gives a non-technical user the three things they need, in order:
//   1. a direct button to the provider's app-creation console
//   2. the exact redirect URI to paste (one-click copy)
//   3. the env-var names to add to Vercel
export function SetupGuide({
  consoleUrl,
  redirectUri,
  envVars,
}: {
  consoleUrl: string;
  redirectUri: string;
  envVars: string[];
}) {
  const [copied, setCopied] = useState<string | null>(null);

  function markCopied(key: string) {
    setCopied(key);
    setTimeout(() => setCopied((c) => (c === key ? null : c)), 1500);
  }

  function legacyCopy(text: string, key: string) {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      markCopied(key);
    } catch {
      /* clipboard unavailable in this context */
    }
  }

  function copy(text: string, key: string) {
    // Clipboard API works on the deployed site; fall back to execCommand in
    // restricted contexts (e.g. sandboxed preview iframes) so copy still works.
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => markCopied(key), () => legacyCopy(text, key));
    } else {
      legacyCopy(text, key);
    }
  }

  const chip = "rounded px-2 py-1 text-xs font-mono";

  return (
    <div className="mt-4 rounded-lg border border-[hsl(220_13%_16%)] bg-[hsl(220_13%_7%)] p-3 space-y-3">
      <p className="text-xs font-semibold text-[hsl(220_9%_70%)]">Connect in 3 steps</p>

      {/* Step 1 — create the app */}
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold" style={{ backgroundColor: "hsl(213 94% 62% / 0.15)", color: "hsl(213 94% 68%)" }}>1</span>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-[hsl(220_9%_56%)] mb-1.5">Create an app in the provider console.</p>
          <a
            href={consoleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded border border-[hsl(213_94%_62%/0.3)] bg-[hsl(213_94%_62%/0.1)] px-2.5 py-1.5 text-xs font-semibold text-[hsl(213_94%_68%)]"
          >
            Open console
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
          </a>
        </div>
      </div>

      {/* Step 2 — redirect URI */}
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold" style={{ backgroundColor: "hsl(213 94% 62% / 0.15)", color: "hsl(213 94% 68%)" }}>2</span>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-[hsl(220_9%_56%)] mb-1.5">Paste this as the authorized redirect URI:</p>
          <button
            type="button"
            onClick={() => copy(redirectUri, "uri")}
            title="Click to copy"
            className={`${chip} block w-full truncate text-left border border-[hsl(220_13%_18%)] bg-[hsl(220_13%_11%)] text-[hsl(220_9%_70%)] hover:border-[hsl(213_94%_62%/0.4)]`}
          >
            {copied === "uri" ? "✓ Copied" : redirectUri}
          </button>
        </div>
      </div>

      {/* Step 3 — env vars */}
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold" style={{ backgroundColor: "hsl(213 94% 62% / 0.15)", color: "hsl(213 94% 68%)" }}>3</span>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-[hsl(220_9%_56%)] mb-1.5">Add the keys to your environment, then redeploy:</p>
          <div className="flex flex-wrap gap-1.5">
            {envVars.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => copy(v, v)}
                title="Click to copy"
                className={`${chip} border border-[hsl(220_13%_18%)] bg-[hsl(220_13%_11%)] text-[hsl(220_9%_62%)] hover:border-[hsl(213_94%_62%/0.4)]`}
              >
                {copied === v ? "✓ Copied" : v}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
