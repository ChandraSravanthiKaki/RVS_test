"use client";

import useSWR from "swr";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function DataPage() {
  const { data } = useSWR("/api/data", fetcher, { refreshInterval: 3000 });

  return (
    <div className="min-h-screen bg-[radial-gradient(100%_100%_at_50%_0%,#2a2458_0%,#0b0b11_60%)] p-6 text-white">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="text-sm text-zinc-400">← Back to home</Link>
        <h1 className="mt-4 text-2xl font-bold">Live User Data</h1>
        <div className="mt-6 overflow-x-auto rounded-xl bg-white/5 ring-1 ring-white/10">
          <table className="min-w-full text-sm">
            <thead className="bg-white/10 text-left">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">About</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3">Birthdate</th>
                <th className="px-4 py-3">Step</th>
                <th className="px-4 py-3">Updated</th>
              </tr>
            </thead>
            <tbody>
              {(data || []).map((row: any) => (
                <tr key={row.id} className="odd:bg-white/5">
                  <td className="px-4 py-3">{row.email}</td>
                  <td className="px-4 py-3 max-w-xs truncate">{row.about_me}</td>
                  <td className="px-4 py-3">{[row.street_address, row.city, row.state, row.zip].filter(Boolean).join(", ")}</td>
                  <td className="px-4 py-3">{row.birthdate || ""}</td>
                  <td className="px-4 py-3">{row.current_step}</td>
                  <td className="px-4 py-3">{new Date(row.updated_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}



