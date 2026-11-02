"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function UploadForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState("zh");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video_source_url: url, topic: topic || null, language }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? `Request failed (${res.status})`);
        return;
      }
      setUrl("");
      setTopic("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  const input = "mt-1 w-full rounded-md border bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-ring";
  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-xl border bg-card/90 p-7 shadow-card backdrop-blur-sm">
      <label className="block text-sm font-medium">
        Video URL
        <input
          type="url"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Direct mp4 / mp3 URL (e.g. CloudFront, Vimeo, Internet Archive)"
          className={input}
        />
        <span className="mt-1 block text-xs text-muted-foreground">
          YouTube links are not supported yet: YouTube blocks downloads from cloud servers.
        </span>
      </label>
      <label className="block text-sm font-medium">
        Topic <span className="font-normal text-muted-foreground">(optional)</span>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Tech podcast — useful context for the model"
          className={input}
        />
      </label>
      <label className="block text-sm font-medium">
        Language
        <select value={language} onChange={(e) => setLanguage(e.target.value)} className={input}>
          <option value="zh">zh</option>
          <option value="en">en</option>
          <option value="ja">ja</option>
        </select>
      </label>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <button disabled={busy} className="w-full rounded-md bg-primary py-2.5 font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60">
        {busy ? "Submitting…" : "Transcribe"}
      </button>
    </form>
  );
}
