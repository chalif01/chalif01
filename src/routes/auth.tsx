import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { claimAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin Access — Chalif Ali Hussein" },
      { name: "description", content: "Private admin sign in for the Chalif Ali Hussein portfolio." },
      { property: "og:title", content: "Admin Access — Chalif Ali Hussein" },
      { property: "og:description", content: "Private admin sign in for the portfolio dashboard." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast.success("Check your email to confirm your account.");
        return;
      }
      await claimAdmin().catch(() => undefined);
      navigate({ to: "/admin", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col justify-center bg-background px-6 py-16 text-foreground sm:px-12">
      <div className="mx-auto w-full max-w-sm">
        <p className="label-xs">Restricted</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">ADMIN ACCESS</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "signin" ? "Sign in to manage your portfolio." : "Create the admin account."}
        </p>

        <form onSubmit={onSubmit} className="mt-10 space-y-4">
          <div>
            <label className="label-xs" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-foreground"
            />
          </div>
          <div>
            <label className="label-xs" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-foreground"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full border border-border px-5 py-3 text-xs tracking-[0.2em] transition-colors hover:bg-accent disabled:opacity-50"
          >
            {busy ? "PLEASE WAIT…" : mode === "signin" ? "SIGN IN" : "CREATE ACCOUNT"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="label-xs mt-6 underline-offset-4 hover:underline"
        >
          {mode === "signin" ? "Create the admin account" : "I already have an account"}
        </button>

        <div className="mt-10">
          <Link to="/" className="label-xs">
            ← Back to site
          </Link>
        </div>
      </div>
    </main>
  );
}
