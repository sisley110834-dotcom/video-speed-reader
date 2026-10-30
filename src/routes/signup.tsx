import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/AuthForm";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create account — Video Speed Reader" },
      { name: "description", content: "Create a Video Speed Reader account and turn videos into transcripts." },
      { property: "og:title", content: "Create account — Video Speed Reader" },
      { property: "og:description", content: "Create a Video Speed Reader account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <AuthForm mode="signup" />,
});
