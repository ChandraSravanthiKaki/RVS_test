"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type ComponentName = "about" | "address" | "birthdate";

const ALL: ComponentName[] = ["about", "address", "birthdate"];

export default function AdminPage() {
  const [step2, setStep2] = useState<ComponentName[]>([]);
  const [step3, setStep3] = useState<ComponentName[]>([]);
  const [saving, setSaving] = useState(false);

  const dbToUi = useMemo(() => ({ about_me: "about", address: "address", birthdate: "birthdate" } as const), []);
  const uiToDb = useMemo(() => ({ about: "about_me", address: "address", birthdate: "birthdate" } as const), []);

  useEffect(() => {
    fetch("/api/config").then((r) => r.json()).then((c) => {
      const s2 = (c.step2_components || []).map((t: string) => (dbToUi as any)[t] ?? t);
      const s3 = (c.step3_components || []).map((t: string) => (dbToUi as any)[t] ?? t);
      setStep2(s2);
      setStep3(s3);
    });
  }, [dbToUi]);

  const toggle = (
    which: 2 | 3,
    name: ComponentName
  ) => {
    const state = which === 2 ? step2 : step3;
    const setter = which === 2 ? setStep2 : setStep3;
    if (state.includes(name)) setter(state.filter((n) => n !== name));
    else setter([...state, name]);
  };

  const save = async () => {
    // Require at least one per page
    if (!step2.length || !step3.length) {
      // eslint-disable-next-line no-alert
      alert("Each of step 2 and 3 must have at least one component.");
      return;
    }
    setSaving(true);
    await fetch("/api/config", {
      method: "POST",
      body: JSON.stringify({
        step2_components: step2.map((t) => (uiToDb as any)[t] ?? t),
        step3_components: step3.map((t) => (uiToDb as any)[t] ?? t),
      }),
    });
    setSaving(false);
  };

  const Badge = ({ active, children }: { active: boolean; children: React.ReactNode }) => (
    <span className={`block w-full rounded-lg px-5 py-3 text-base ring-1 text-center ${active ? "bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white ring-transparent shadow" : "bg-white/10 text-zinc-200 ring-white/10 hover:bg-white/15"}`}>
      {children}
    </span>
  );

  const Card = ({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) => (
    <div className="relative overflow-hidden rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_80%_at_0%_0%,rgba(232,121,249,0.15)_0%,transparent_60%)]" />
      <div className="mb-3">
        <div className="text-lg font-semibold">{title}</div>
        <div className="text-xs text-zinc-400">{subtitle}</div>
      </div>
      {children}
    </div>
  );

  const Box = ({ which }: { which: 2 | 3 }) => {
    const selected = which === 2 ? step2 : step3;
    const setter = which === 2 ? setStep2 : setStep3;
    return (
      <Card title={`Page ${which} components`} subtitle="Click to toggle components. At least one per page.">
        <div className="flex flex-col gap-3">
          {ALL.map((n) => (
            <button key={n} onClick={() => toggle(which, n)} className="w-full">
              <Badge active={selected.includes(n)}>{n}</Badge>
            </button>
          ))}
        </div>
        <div className="mt-4 text-xs text-zinc-300">{selected.length ? `Selected: ${selected.join(', ')}` : "Selected: none"}</div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(100%_100%_at_50%_0%,#2a2458_0%,#0b0b11_60%)] text-white">
      <Link href="/" className="fixed left-6 top-6 text-sm text-zinc-300 hover:text-white">← Back to home</Link>
      <div className="mx-auto max-w-[1400px] px-8 py-24">
        <h1 className="text-4xl font-bold">Admin: Configure Onboarding Flow</h1>
        <p className="mt-2 text-zinc-300">Choose which components appear on steps 2 and 3. At least one per step.</p>
        <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-2">
          <Box which={2} />
          <Box which={3} />
        </div>
        <div className="mt-10">
          <button onClick={save} className="rounded-lg bg-gradient-to-r from-fuchsia-500 to-violet-500 px-8 py-3 text-base font-semibold shadow hover:from-fuchsia-600 hover:to-violet-600">{saving ? "Saving..." : "Save configuration"}</button>
        </div>
      </div>
    </div>
  );
}



