import { AuthForm } from "@/components/AuthForm";
import { usePageMeta } from "@/hooks/use-page-meta";

export default function SignUp() {
  usePageMeta({
    title: "Create account — Video Speed Reader",
    description: "Create a Video Speed Reader account and turn videos into transcripts.",
  });
  return <AuthForm mode="signup" />;
}
