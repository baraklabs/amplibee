"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleButton } from "./google-button";
import { login, signup, verifyCode, resendCode, requestPasswordReset } from "./actions";
import { loginSchema, signUpSchema, forgotPasswordSchema } from "@/lib/validation/auth";
import { cn } from "@/lib/utils";

type Mode = "signin" | "signup";

const COPY: Record<Mode, { heading: string; submitLabel: string; submittingLabel: string; toggleHint: string; toggleCta: string }> = {
  signin: {
    heading: "Log in to Oyekool",
    submitLabel: "Log in",
    submittingLabel: "Logging in…",
    toggleHint: "New to Oyekool?",
    toggleCta: "Create an account",
  },
  signup: {
    heading: "Get started for free",
    submitLabel: "Create account",
    submittingLabel: "Creating account…",
    toggleHint: "Already have an account?",
    toggleCta: "Log in",
  },
};

export function AuthCard({ initialMode }: { initialMode: Mode }) {
  const router = useRouter();

  const [mode, setMode] = React.useState<Mode>(initialMode);
  const [showForgot, setShowForgot] = React.useState(false);

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [errors, setErrors] = React.useState<{ name?: string; email?: string; password?: string; form?: string }>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [googleValidating, setGoogleValidating] = React.useState(false);
  const [pendingVerification, setPendingVerification] = React.useState(false);

  function flipTo(next: Mode) {
    setErrors({});
    setShowForgot(false);
    setMode(next);
  }

  function flipToForgot() {
    setErrors({});
    setShowForgot(true);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (mode === "signin") {
      const parsed = loginSchema.safeParse({ email, password });
      if (!parsed.success) {
        const issue = parsed.error.issues[0];
        setErrors({ [issue.path[0] as string]: issue.message });
        return;
      }
      setSubmitting(true);
      setErrors({});
      const result = await login(parsed.data.email, parsed.data.password);
      setSubmitting(false);
      if (!result.ok) {
        setErrors({ form: result.error });
        return;
      }
      if (result.requiresVerification) {
        setPendingVerification(true);
        return;
      }
      router.push("/dashboard");
      router.refresh();
      return;
    }

    const parsed = signUpSchema.safeParse({ fullName: name, email, password });
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const field = issue.path[0] === "fullName" ? "name" : (issue.path[0] as string);
      setErrors({ [field]: issue.message });
      return;
    }
    setSubmitting(true);
    setErrors({});
    const result = await signup(parsed.data.fullName, parsed.data.email, parsed.data.password);
    setSubmitting(false);
    if (!result.ok) {
      setErrors({ form: result.error });
      return;
    }
    if (result.requiresVerification) {
      setPendingVerification(true);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  if (pendingVerification) {
    return (
      <VerifyFace email={email} onBack={() => setPendingVerification(false)} />
    );
  }

  return (
    <div className="auth-flip w-full">
      <div className="auth-flip-inner" data-flipped={mode === "signup" || showForgot ? "true" : "false"}>
        <div className="auth-face auth-face-front">
          <AuthFace
            mode="signin"
            active={mode === "signin" && !showForgot}
            name={name}
            setName={setName}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            errors={errors}
            submitting={submitting}
            googleValidating={googleValidating}
            setGoogleValidating={setGoogleValidating}
            onSubmit={onSubmit}
            onToggle={() => flipTo("signup")}
            onForgot={flipToForgot}
          />
        </div>

        <div className="auth-face auth-face-back">
          {showForgot ? (
            <ForgotPasswordFace onBack={() => setShowForgot(false)} />
          ) : (
            <AuthFace
              mode="signup"
              active={mode === "signup"}
              name={name}
              setName={setName}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              errors={errors}
              submitting={submitting}
              googleValidating={googleValidating}
              setGoogleValidating={setGoogleValidating}
              onSubmit={onSubmit}
              onToggle={() => flipTo("signin")}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function AuthFace({
  mode,
  active,
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  errors,
  submitting,
  googleValidating,
  setGoogleValidating,
  onSubmit,
  onToggle,
  onForgot,
}: {
  mode: Mode;
  active: boolean;
  name: string;
  setName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (fn: (prev: boolean) => boolean) => void;
  errors: { name?: string; email?: string; password?: string; form?: string };
  submitting: boolean;
  googleValidating: boolean;
  setGoogleValidating: (v: boolean) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onToggle: () => void;
  onForgot?: () => void;
}) {
  const copy = COPY[mode];
  const inert = active ? {} : { tabIndex: -1, "aria-hidden": true as const };
  const formDisabled = active && googleValidating;

  return (
    <div className="auth-card rounded-lg border border-border bg-card p-7 shadow-sm">
      <h1 className="font-heading text-center text-xl font-semibold text-foreground">{copy.heading}</h1>

      {active && errors.form && (
        <p className="mt-6 rounded-md bg-destructive-soft px-3 py-2 text-sm text-destructive" role="alert">
          {errors.form}
        </p>
      )}

      <form
        onSubmit={onSubmit}
        className={cn("flex flex-col gap-4", !(active && errors.form) && "mt-6")}
        noValidate={active}
      >
        {mode === "signup" && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${mode}-name`}>Full name</Label>
            <Input
              id={`${mode}-name`}
              name="name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={formDisabled}
              {...inert}
            />
            {active && errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${mode}-email`}>Email</Label>
          <Input
            id={`${mode}-email`}
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={formDisabled}
            {...inert}
          />
          {active && errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor={`${mode}-password`}>Password</Label>
            {mode === "signin" && (
              <button
                type="button"
                onClick={onForgot}
                className="text-xs font-medium text-muted-foreground hover:text-foreground"
                {...inert}
              >
                Forgot password?
              </button>
            )}
          </div>
          <div className="relative">
            <Input
              id={`${mode}-password`}
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10"
              disabled={formDisabled}
              {...inert}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              {...inert}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {active && errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
        </div>

        <Button
          type="submit"
          loading={active && (submitting || googleValidating)}
          disabled={formDisabled}
          className="mt-1"
          {...inert}
        >
          {active && (submitting || googleValidating) ? copy.submittingLabel : copy.submitLabel}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <GoogleButton disabled={active && submitting} onValidatingChange={setGoogleValidating} />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {copy.toggleHint}{" "}
        <Link
          href="/login"
          onClick={(e) => {
            e.preventDefault();
            onToggle();
          }}
          className="font-medium text-foreground hover:underline"
          {...inert}
        >
          {copy.toggleCta}
        </Link>
      </p>
    </div>
  );
}

function ForgotPasswordFace({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string>();
  const [submitting, setSubmitting] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message);
      return;
    }
    setSubmitting(true);
    setError(undefined);
    const result = await requestPasswordReset(parsed.data.email);
    setSubmitting(false);
    // Deliberately shows success either way — the backend won't say whether an
    // account exists for that address, and neither should the UI.
    if (!result.ok) setError(result.error);
    else setSent(true);
  }

  return (
    <div className="auth-card rounded-lg border border-border bg-card p-7 shadow-sm">
      <h1 className="font-heading text-center text-xl font-semibold text-foreground">
        Reset your password
      </h1>

      {sent ? (
        <>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            If an account exists for <strong className="text-foreground">{email.trim()}</strong>, we&apos;ve
            emailed a reset link.
          </p>
          <Button variant="outline" className="mt-6 w-full" onClick={onBack}>
            Back to log in
          </Button>
        </>
      ) : (
        <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Enter the email on your account and we&apos;ll send you a reset link.
          </p>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="forgot-email">Email</Label>
            <Input
              id="forgot-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" loading={submitting}>
            Send reset link
          </Button>
          <button
            type="button"
            onClick={onBack}
            className="text-center text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Back to log in
          </button>
        </form>
      )}
    </div>
  );
}

function VerifyFace({ email, onBack }: { email: string; onBack: () => void }) {
  const router = useRouter();
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState<string>();
  const [submitting, setSubmitting] = React.useState(false);
  const [resent, setResent] = React.useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!code.trim()) {
      setError("Enter the code we emailed you.");
      return;
    }
    setSubmitting(true);
    setError(undefined);
    const result = await verifyCode(code.trim());
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  async function onResend() {
    setError(undefined);
    setResent(false);
    const result = await resendCode();
    if (!result.ok) setError(result.error);
    else setResent(true);
  }

  return (
    <div className="auth-card rounded-lg border border-border bg-card p-7 shadow-sm">
      <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-accent-soft">
        <CheckCircle2 className="size-5 text-accent" />
      </div>
      <h1 className="font-heading mt-4 text-center text-lg font-semibold text-foreground">
        Check your email
      </h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        We sent a 6-digit code {email ? <>to <strong className="text-foreground">{email}</strong></> : null}. Enter
        it below, or click the link in the email.
      </p>

      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="verify-code">Verification code</Label>
          <Input
            id="verify-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        {resent && !error && <p className="text-sm text-success">A new code is on its way.</p>}
        <Button type="submit" loading={submitting}>
          Verify
        </Button>
      </form>

      <div className="mt-5 flex items-center justify-between text-sm">
        <button type="button" onClick={onBack} className="font-medium text-muted-foreground hover:text-foreground">
          Back
        </button>
        <button type="button" onClick={onResend} className="font-medium text-foreground hover:underline">
          Resend code
        </button>
      </div>
    </div>
  );
}
