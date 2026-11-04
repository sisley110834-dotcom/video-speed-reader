import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Sign in — Video Speed Reader",
  description: "Sign in to Video Speed Reader to get your transcripts.",
};

export default function SignIn() {
  return <AuthForm mode="signin" />;
}
