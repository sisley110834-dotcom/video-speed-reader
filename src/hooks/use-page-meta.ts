import { useEffect } from "react";

// Client-side replacement for per-route <head> meta (previously rendered on the server).
export function usePageMeta({ title, description }: { title: string; description?: string }) {
  useEffect(() => {
    document.title = title;
    setMeta("name", "description", description);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
  }, [title, description]);
}

function setMeta(attr: "name" | "property", key: string, content: string | undefined) {
  if (content === undefined) return;
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}
