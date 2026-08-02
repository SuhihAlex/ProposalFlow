import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/auth-form";

export default function RegisterPage() {
  return <AuthShell title="Create your workspace" description="Start with the Free plan and prepare up to three client-ready proposals."><RegisterForm /></AuthShell>;
}
