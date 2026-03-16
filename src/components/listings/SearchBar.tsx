"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function SearchBar() {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [city, setCity] = useState(params.get("city") ?? "");

  const onSubmit = () => {
    const search = new URLSearchParams();
    if (q) search.set("q", q);
    if (city) search.set("city", city);
    router.push(`/search?${search.toString()}`);
  };

  return (
    <div className="grid gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-md)] md:grid-cols-[2fr_1fr_auto]">
      <Input placeholder="Search properties, suburbs, cities" value={q} onChange={(e) => setQ(e.target.value)} />
      <Input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
      <Button variant="accent" onClick={onSubmit}>Search</Button>
    </div>
  );
}
