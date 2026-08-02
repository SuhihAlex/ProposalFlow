import { LoginForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";

type LoginPageProps = {
  searchParams: Promise<{
    next?: string | string[];
    error?: string | string[];
  }>;
};

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getSafeNextPath(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }

  return value;
}

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const params = await searchParams;

  const next = getSafeNextPath(getSingleValue(params.next));
  const error = getSingleValue(params.error);

  return (
    <AuthShell
      title="Welcome back"
      description="Log in to continue working with your proposals and client responses."
    >
      <LoginForm next={next} routeError={error} />
    </AuthShell>
  );
}