import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/password-form";

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Choose a new password"
      description="Use at least eight characters and avoid reusing an old password."
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}