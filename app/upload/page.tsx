import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Download } from "lucide-react";
import { Logo } from "@/components/Logo";
import { SignOutButton } from "@/components/SignOutButton";
import { UploadForm } from "@/components/UploadForm";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Upload — Video Speed Reader",
  description: "Submit a video URL and get a transcript.",
};

const statusStyles: Record<string, string> = {
  pending: "bg-gray-200 text-gray-700",
  downloading: "bg-gray-200 text-gray-700",
  transcribe: "bg-blue-100 text-blue-800",
  done: "bg-green-100 text-green-800",
};

function truncate(s: string, n: number) {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}

export default async function UploadPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  // RLS ("users read own jobs") already limits rows to this user; the filter is explicit anyway.
  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("id, created_at, video_source_url, status")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="min-h-screen">
      <header className="bg-meadow border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Logo to="/app" />
          <div className="flex items-center gap-3">
            <Link href="/app" className="text-sm font-semibold text-primary underline-offset-4 hover:underline">
              Dashboard
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-10 px-5 py-14">
        <section>
          <h1 className="text-3xl font-bold md:text-4xl">Your transcriptions</h1>
          <div className="mt-6 overflow-x-auto rounded-xl border bg-card/85 shadow-card backdrop-blur-sm">
            {error ? (
              <p className="p-6 text-sm text-destructive">Could not load your jobs: {error.message}</p>
            ) : !jobs || jobs.length === 0 ? (
              <p className="p-6 text-muted-foreground">No transcriptions yet. Submit your first video below.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="border-b text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Created</th>
                    <th className="px-4 py-3 font-medium">URL</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Transcript</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.id} className="border-b last:border-0">
                      <td className="whitespace-nowrap px-4 py-3">
                        {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs" title={job.video_source_url}>
                        {truncate(job.video_source_url, 50)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[job.status] ?? statusStyles.pending}`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {job.status === "done" ? (
                          <a
                            href={`/api/jobs/${job.id}/transcript`}
                            download={`transcript-${job.id.slice(0, 8)}.txt`}
                            className="inline-flex items-center gap-1 font-semibold text-primary underline-offset-4 hover:underline"
                          >
                            <Download className="h-4 w-4" />
                            .txt
                          </a>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold md:text-3xl">Submit a video</h2>
          <UploadForm />
        </section>
      </main>
    </div>
  );
}
