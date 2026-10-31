import { AuthForm } from "@/components/AuthForm";
import { usePageMeta } from "@/hooks/use-page-meta";

export default function SignIn() {
  usePageMeta({
    title: "Sign in — Video Speed Reader",
    description: "Sign in to Video Speed Reader to get your transcripts.",
  });
  return <AuthForm mode="signin" />;
}
