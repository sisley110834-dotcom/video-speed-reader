import type { Metadata } from "next";
import Link from "next/link";
import { AudioLines, Timer, BadgeCheck } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Video Speed Reader — Transcripts in three minutes",
  description:
    "Upload your video, get a clean, accurate transcript in three minutes. Chinese and English, commercial-use ready.",
  openGraph: {
    title: "Video Speed Reader — Transcripts in three minutes",
    description:
      "Upload your video, get a clean, accurate transcript in three minutes. Chinese and English, commercial-use ready.",
  },
};

const features = [
  { icon: AudioLines, title: "高準確度逐字稿", en: "High-accuracy transcripts", body: "Powered by OpenAI Whisper. Supports Chinese and English." },
  { icon: Timer, title: "三分鐘交付", en: "Three-minute turnaround", body: "Processed in the background — you get an email when it's ready." },
  { icon: BadgeCheck, title: "可商用授權", en: "Commercial-use ready", body: "You own the output. Use it however you like." },
];

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-meadow">
        <header>
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
            <Logo />
            <Link href="/signin" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-card transition hover:opacity-90">
              Sign in / 登入
            </Link>
          </div>
        </header>

        <section>
          <div className="mx-auto max-w-6xl px-5 pb-48 pt-16 md:pb-72 md:pt-24">
            <Reveal>
              <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-accent-foreground">For creators, educators & engineers</p>
              <h1 className="text-6xl font-bold leading-tight text-title md:text-8xl">Video Speed Reader</h1>
              <p className="mt-6 text-2xl font-semibold md:text-3xl">上傳影片，三分鐘內拿到逐字稿。</p>
              <p className="mt-3 max-w-xl text-lg text-muted-foreground">Upload your video, get a clean transcript in three minutes.</p>
              <div className="mt-10">
                <Link href="/signup" className="inline-block rounded-md bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-card transition hover:-translate-y-0.5 hover:opacity-90">
                  Get started free
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </div>

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-20">
        <Reveal>
          <h2 className="text-4xl font-bold md:text-5xl">Why Video Speed Reader</h2>
        </Reveal>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.en} delay={i * 120}>
              <article className="h-full rounded-xl border bg-card/85 p-7 shadow-card backdrop-blur-sm">
                <f.icon className="h-8 w-8 text-primary" />
                <h3 className="mt-5 text-2xl font-bold">{f.title}</h3>
                <p className="text-sm font-medium text-accent-foreground">{f.en}</p>
                <p className="mt-3 text-muted-foreground">{f.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">© 2026 Video Speed Reader</footer>
    </div>
  );
}
