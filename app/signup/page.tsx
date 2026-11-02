import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Create account — Video Speed Reader",
  description: "Create a Video Speed Reader account and turn videos into transcripts.",
};

export default function SignUp() {
  return <AuthForm mode="signup" />;
}
