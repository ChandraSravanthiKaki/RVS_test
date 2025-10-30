"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type ComponentName = "about" | "address" | "birthdate";

type Config = {
  step2_components: ComponentName[];
  step3_components: ComponentName[];
};

const StepIndicator = ({ current }: { current: number }) => (
  <div className="mb-6 flex items-center justify-center gap-2 text-xs text-zinc-300">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className={`h-2 w-8 rounded-full ${i <= current ? "bg-fuchsia-500" : "bg-white/10"}`}
      />
    ))}
  </div>
);

export default function OnboardingPage() {
  const [config, setConfig] = useState<Config | null>(null);
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [initialEmail, setInitialEmail] = useState<string | null>(null);

  const [about, setAbout] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; birthdate?: string }>({});

  const validate = (e?: string, p?: string) => {
    const nextErrors: { email?: string; password?: string } = {};
    const emailToCheck = e ?? email;
    const passToCheck = p ?? password;
    const emailOk = /\S+@\S+\.\S+/.test(emailToCheck);
    if (!emailOk) nextErrors.email = "Enter a valid email address";
    const passOk = /^(?=.*[^A-Za-z0-9]).{8,}$/.test(passToCheck);
    if (!passOk) nextErrors.password = "Min 8 chars and at least 1 special character";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateBirthdate = (dateStr?: string): string | undefined => {
    const dateToCheck = dateStr ?? birthdate;
    if (!dateToCheck) return undefined; // Birthdate is optional
    
    const date = new Date(dateToCheck);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Please enter a valid date";
    }
    
    // Check if date is in the future
    if (date > today) {
      return "Birthdate cannot be in the future";
    }
    
    // Check if date is too far in the past (more than 150 years ago)
    const minDate = new Date();
    minDate.setFullYear(today.getFullYear() - 150);
    if (date < minDate) {
      return "Please enter a valid birthdate";
    }
    
    // Check minimum age (at least 13 years old, adjust as needed)
    const minAgeDate = new Date();
    minAgeDate.setFullYear(today.getFullYear() - 13);
    if (date > minAgeDate) {
      return "You must be at least 13 years old";
    }
    
    return undefined;
  };

  useEffect(() => {
    // Load config with safe JSON parse and fallback if API fails
    (async () => {
      try {
        const r = await fetch("/api/config");
        if (!r.ok) {
          setConfig({
            step2_components: ["about", "birthdate"],
            step3_components: ["address"],
          });
          return;
        }
        const cfg = await r.json();
        setConfig(cfg);
      } catch {
        setConfig({
          step2_components: ["about", "birthdate"],
          step3_components: ["address"],
        });
      }
    })();
  }, []);

  useEffect(() => {
    // Resume progress from localStorage user id
    const localId = typeof window !== "undefined" ? localStorage.getItem("onboarding_user_id") : null;
    if (!localId) return;
    fetch(`/api/onboarding?userId=${localId}`).then(async (res) => {
      if (!res.ok) return;
      const d = await res.json();
      setStep(d.step ?? 1);
      setEmail(d.email ?? "");
      setInitialEmail(d.email ?? null);
      setAbout(d.about ?? "");
      setBirthdate(d.birthdate ?? "");
      setStreet(d.street ?? "");
      setCity(d.city ?? "");
      setState(d.state ?? "");
      setZip(d.zip ?? "");
    });
  }, []);

  const saveProgress = async (newStep: number) => {
    const userId = typeof window !== "undefined" ? localStorage.getItem("onboarding_user_id") : null;
    const body: any = {
      userId: userId ? Number(userId) : undefined,
      email,
      step: newStep,
      about,
      birthdate: birthdate || null,
      address: { street, city, state, zip },
    };
    const res = await fetch("/api/onboarding", { method: "POST", body: JSON.stringify(body) });
    if (!res.ok) {
      // eslint-disable-next-line no-alert
      alert("Saving failed. Ensure Supabase env vars are set and tables exist.");
      return;
    }
    setStep(newStep);
  };

  const onSubmitFirst = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!validate()) {
        setLoading(false);
        return;
      }
      // Create a new user if none exists, or if the email has changed from the resumed user
      let userId = typeof window !== "undefined" ? localStorage.getItem("onboarding_user_id") : null;
      if (userId && initialEmail && initialEmail !== email) {
        // Start a brand-new registration for a different email
        localStorage.removeItem("onboarding_user_id");
        userId = null;
      }
      if (!userId) {
        const res = await fetch("/api/onboarding", {
          method: "POST",
          body: JSON.stringify({ email, password, step: 2 }),
        });
        if (!res.ok) {
          // eslint-disable-next-line no-alert
          alert("Create failed. Ensure Supabase env vars are set and tables exist.");
          return;
        }
        const created = await res.json();
        localStorage.setItem("onboarding_user_id", String(created.id));
        setStep(created.current_step ?? 2);
        return;
      }
      const res2 = await fetch("/api/onboarding", {
        method: "POST",
        body: JSON.stringify({ userId: Number(userId), email, password, step: 2 }),
      });
      if (!res2.ok) {
        // eslint-disable-next-line no-alert
        alert("Save failed. Ensure Supabase env vars are set and tables exist.");
        return;
      }
      setStep(2);
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const onSubmitStep = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate birthdate if it's on the current step
    const currentComponents = step === 2 ? config?.step2_components : config?.step3_components;
    if (currentComponents?.includes("birthdate")) {
      const birthdateError = validateBirthdate();
      if (birthdateError) {
        setErrors({ ...errors, birthdate: birthdateError });
        return;
      }
    }
    const next = step + 1;
    await saveProgress(next);
  };

  const renderComponent = (name: ComponentName) => {
    switch (name) {
      case "about":
        return (
          <label className="block">
            <div className="mb-2 text-base font-medium text-zinc-300">About Me</div>
            <textarea className="w-full rounded-lg bg-white/5 p-3 text-white ring-1 ring-white/10" rows={5} value={about} onChange={(e) => setAbout(e.target.value)} />
          </label>
        );
      case "birthdate":
        return (
          <label className="block">
            <div className="mb-2 text-base font-medium text-zinc-300">Birthdate</div>
            <input
              type="date"
              className={`w-full rounded-lg bg-white/5 p-3 text-white outline-none transition focus:bg-white/10 ${errors.birthdate ? "ring-2 ring-red-500" : "ring-1 ring-white/10"}`}
              value={birthdate}
              onChange={(e) => {
                setBirthdate(e.target.value);
                const error = validateBirthdate(e.target.value);
                setErrors({ ...errors, birthdate: error });
              }}
              onBlur={() => {
                const error = validateBirthdate();
                setErrors({ ...errors, birthdate: error });
              }}
            />
            {errors.birthdate && <p className="mt-1 text-xs text-red-400">{errors.birthdate}</p>}
          </label>
        );
      case "address":
        return (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="block md:col-span-2">
              <div className="mb-2 text-base font-medium text-zinc-300">Street Address</div>
              <input className="w-full rounded-lg bg-white/5 p-3 text-white ring-1 ring-white/10" value={street} onChange={(e) => setStreet(e.target.value)} />
            </label>
            <label className="block">
              <div className="mb-2 text-base font-medium text-zinc-300">City</div>
              <input className="w-full rounded-lg bg-white/5 p-3 text-white ring-1 ring-white/10" value={city} onChange={(e) => setCity(e.target.value)} />
            </label>
            <label className="block">
              <div className="mb-2 text-base font-medium text-zinc-300">State</div>
              <input className="w-full rounded-lg bg-white/5 p-3 text-white ring-1 ring-white/10" value={state} onChange={(e) => setState(e.target.value)} />
            </label>
            <label className="block md:col-span-2">
              <div className="mb-2 text-base font-medium text-zinc-300">Zip</div>
              <input className="w-full rounded-lg bg-white/5 p-3 text-white ring-1 ring-white/10" value={zip} onChange={(e) => setZip(e.target.value)} />
            </label>
          </div>
        );
    }
  };

  const stepComponents = step === 2 ? config?.step2_components : config?.step3_components;

  return (
    <div className="min-h-screen bg-[radial-gradient(100%_100%_at_50%_0%,#2a2458_0%,#0b0b11_60%)] text-white">
      <Link href="/" className="fixed left-6 top-6 text-sm text-zinc-300 hover:text-white">← Back to home</Link>
      <div className="mx-auto max-w-[1400px] px-8 py-24">
        <StepIndicator current={step} />
        {step === 1 && (
          <div className="mt-10 grid grid-cols-1 items-stretch gap-10 md:grid-cols-2">
            {/* Left visual container (no parent wrapper) */}
            <div className="relative order-2 overflow-hidden rounded-3xl bg-[linear-gradient(135deg,rgba(232,121,249,0.22),rgba(99,102,241,0.22))] p-10 shadow-2xl md:order-1 min-h-[28rem]">
              <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-fuchsia-500/25 blur-3xl" />
              <div className="pointer-events-none absolute -left-20 -bottom-24 h-80 w-80 rounded-full bg-violet-500/25 blur-3xl" />
              <div className="relative flex h-full flex-col items-center justify-center text-center">
                <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl">Let’s get started</h2>
                <div className="mt-8 w-full max-w-xl">
                  <Image src="/step1.png" alt="Step 1" width={600} height={360} className="w-full rounded-2xl object-contain" />
                </div>
              </div>
            </div>

            {/* Right form container (no parent wrapper) */}
            <form onSubmit={onSubmitFirst} className="order-1 space-y-5 rounded-3xl bg-black/40 p-10 shadow-2xl backdrop-blur md:order-2 min-h-[28rem]">
              <div className="text-3xl font-semibold">Create your account</div>
              <label className="block">
                <div className="mb-1 text-base font-medium text-zinc-300">Email</div>
                <input
                  type="email"
                  required
                  className={`w-full rounded-xl bg-white/10 p-3 text-white outline-none transition focus:bg-white/15 ${errors.email ? "ring-2 ring-red-500" : ""}`}
                  value={email}
                  onChange={(ev) => { setEmail(ev.target.value); validate(ev.target.value, undefined); }}
                />
                {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
              </label>
              <label className="block">
                <div className="mb-1 text-base font-medium text-zinc-300">Password</div>
                <input
                  type="password"
                  required
                  minLength={8}
                  pattern="^(?=.*[^A-Za-z0-9]).{8,}$"
                  title="At least 8 characters and 1 special character"
                  className={`w-full rounded-xl bg-white/10 p-3 text-white outline-none transition focus:bg-white/15 ${errors.password ? "ring-2 ring-red-500" : ""}`}
                  value={password}
                  onChange={(ev) => { setPassword(ev.target.value); validate(undefined, ev.target.value); }}
                />
                {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
              </label>
              <button disabled={loading} className="mt-2 w-full rounded-xl bg-gradient-to-r from-fuchsia-500 to-violet-500 px-6 py-3 font-semibold text-white shadow-lg hover:from-fuchsia-600 hover:to-violet-600 disabled:opacity-50">{loading ? "Creating..." : "Continue"}</button>
            </form>
          </div>
        )}
        {step > 1 && step < 4 && (
          <div className="mt-10 grid grid-cols-1 items-stretch gap-10 md:grid-cols-2">
            {/* Left visual container */}
            <div className={`relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,rgba(232,121,249,0.22),rgba(99,102,241,0.22))] p-10 shadow-2xl min-h-[28rem] ${step === 2 ? 'order-2 md:order-2' : 'order-1'}` }>
              <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-fuchsia-500/25 blur-3xl" />
              <div className="pointer-events-none absolute -left-20 -bottom-24 h-80 w-80 rounded-full bg-violet-500/25 blur-3xl" />
              <div className="relative flex h-full flex-col items-center justify-center text-center">
                <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl">Tell us a bit more</h2>
                {step === 2 ? (
                  <div className="mt-8 w-full max-w-xl">
                    <Image src="/step2.png" alt="Step 2" width={600} height={360} className="h-[360px] w-full rounded-2xl object-contain" />
                  </div>
                ) : (
                  <svg viewBox="0 0 200 120" className="mt-8 h-[360px] w-full text-violet-300/80">
                    <defs>
                      <linearGradient id="g3" x1="0" x2="1">
                        <stop offset="0%" stopColor="currentColor" stopOpacity="0.9"/>
                        <stop offset="100%" stopColor="currentColor" stopOpacity="0.3"/>
                      </linearGradient>
                    </defs>
                    <path d="M10 60 C 60 10, 140 110, 190 60" fill="none" stroke="url(#g3)" strokeWidth="4" />
                    <circle cx="10" cy="60" r="3" fill="currentColor" />
                    <circle cx="190" cy="60" r="3" fill="currentColor" />
                  </svg>
                )}
              </div>
            </div>

            {/* Right form container */}
            <div className={`rounded-3xl bg-black/40 p-10 shadow-2xl backdrop-blur ${step === 2 ? 'order-1 md:order-1' : 'order-2'}` }>
              <form onSubmit={onSubmitStep} className="space-y-6">
                <div className="text-3xl font-semibold">Additional details</div>
                <div className="space-y-4">
                  {stepComponents?.map((c) => (
                    <div key={c}>{renderComponent(c)}</div>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <button type="button" onClick={() => saveProgress(step - 1)} className="rounded-lg bg-white/10 px-4 py-2 text-sm transition hover:bg-white/15">Back</button>
                  <button className="rounded-lg bg-gradient-to-r from-fuchsia-500 to-violet-500 px-6 py-2 text-sm font-semibold text-white shadow hover:from-fuchsia-600 hover:to-violet-600">{step === 3 ? "Finish" : "Next"}</button>
                </div>
              </form>
            </div>
          </div>
        )}
        {step >= 4 && (
          <div className="mt-6 rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
            <div className="space-y-4">
              <div className="text-xl font-semibold">All set! 🎉</div>
              <p className="text-zinc-300">Your information has been saved. You can see the live data on the <Link className="underline" href="/data">Data</Link> page.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


