import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();

  if (data?.claims) {
    await supabase.auth.signOut({
      scope: "local",
    });
  }

  revalidatePath("/", "layout");

  return NextResponse.redirect(new URL("/login", request.url), {
    status: 303,
  });
}