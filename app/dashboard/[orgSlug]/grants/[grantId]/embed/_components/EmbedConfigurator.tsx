"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/app/_components/ui/Button";
import { Card } from "@/app/_components/ui/Card";
import { Select } from "@/app/_components/ui/Select";

interface Props {
  grantId: string;
  grantTitle: string;
  orgName: string;
}

type Theme = "light" | "dark";
type Size = "full" | "compact";

const BASE_EMBED_URL = "https://team1.grants/embed/grants";

export function EmbedConfigurator({ grantId, grantTitle, orgName }: Props) {
  const [theme, setTheme] = useState<Theme>("light");
  const [size, setSize] = useState<Size>("full");

  const url = useMemo(() => {
    const sp = new URLSearchParams();
    if (theme !== "light") sp.set("theme", theme);
    if (size === "compact") sp.set("compact", "1");
    const qs = sp.toString();
    return `${BASE_EMBED_URL}/${grantId}${qs ? `?${qs}` : ""}`;
  }, [grantId, theme, size]);

  const iframe = useMemo(() => {
    const height = size === "compact" ? 180 : 360;
    return `<iframe src="${url}" width="100%" height="${height}" frameborder="0" loading="lazy" title="${grantTitle}"></iframe>`;
  }, [url, size, grantTitle]);

  const script = useMemo(() => {
    return `<script src="https://team1.grants/embed.js" data-grant-id="${grantId}" data-theme="${theme}"${size === "compact" ? ' data-compact="1"' : ""}></script>`;
  }, [grantId, theme, size]);

  function copy(s: string) {
    navigator.clipboard.writeText(s).catch(() => undefined);
    toast.success("Copied");
  }

  return (
    <>
      <Card title="Appearance">
        <div className="grid gap-3 md:grid-cols-2">
          <Select
            label="Theme"
            value={theme}
            onChange={(e) => setTheme(e.target.value as Theme)}
            options={[
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
            ]}
          />
          <Select
            label="Size"
            value={size}
            onChange={(e) => setSize(e.target.value as Size)}
            options={[
              { value: "full", label: "Full — 360px tall, every detail" },
              { value: "compact", label: "Compact — 180px, title + CTA only" },
            ]}
          />
        </div>
      </Card>

      <Card title="Preview">
        <div
          className={
            theme === "dark"
              ? "flex flex-col gap-2 border border-[var(--color-border-muted)] bg-[var(--color-bg-inverted)] p-4 text-[var(--color-fg-on-inverted)]"
              : "flex flex-col gap-2 border border-[var(--color-border-muted)] bg-[var(--color-bg)] p-4 text-[var(--color-fg)]"
          }
        >
          <span className="text-[10px] font-semibold uppercase tracking-widest">
            Powered by Backyard · {orgName}
          </span>
          <h3 className="text-lg font-bold">{grantTitle}</h3>
          {size === "full" ? (
            <>
              <p className="text-sm">
                Live application count, deadline countdown, and an Apply CTA that opens{" "}
                /discover/grants/{grantId} in a new tab.
              </p>
              <p className="text-xs">
                <strong>3 open · ~42 days left · pool USD 250,000</strong>
              </p>
            </>
          ) : (
            <p className="text-xs">
              Compact preview — drops everything except title + Apply CTA.
            </p>
          )}
          <div>
            <span
              className={
                theme === "dark"
                  ? "inline-block border border-white bg-[var(--color-bg)] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg)]"
                  : "inline-block border border-[var(--color-border-muted)] bg-[var(--color-bg-inverted)] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-on-inverted)]"
              }
            >
              Apply →
            </span>
          </div>
        </div>
      </Card>

      <Card title="Iframe snippet">
        <div className="flex items-start gap-2">
          <pre className="flex-1 overflow-x-auto border border-[var(--color-border-muted)] bg-[var(--color-bg-muted)] p-3 font-mono text-xs">
            {iframe}
          </pre>
          <Button size="sm" variant="secondary" onClick={() => copy(iframe)}>
            Copy
          </Button>
        </div>
        <p className="mt-2 text-xs text-[var(--color-fg-muted)]">
          Paste anywhere that accepts HTML. No JS needed — the iframe is server-rendered
          and cached for 60s.
        </p>
      </Card>

      <Card title="Script tag (drop-in)">
        <div className="flex items-start gap-2">
          <pre className="flex-1 overflow-x-auto border border-[var(--color-border-muted)] bg-[var(--color-bg-muted)] p-3 font-mono text-xs">
            {script}
          </pre>
          <Button size="sm" variant="secondary" onClick={() => copy(script)}>
            Copy
          </Button>
        </div>
        <p className="mt-2 text-xs text-[var(--color-fg-muted)]">
          Use when iframes are blocked (some CMSs). Renders the widget into the spot you
          drop the script. Same hourly cache.
        </p>
      </Card>
    </>
  );
}
