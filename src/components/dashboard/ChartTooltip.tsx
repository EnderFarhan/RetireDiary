'use client';

import { formatCurrency } from '@/lib/fee-math';

export function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl shadow-xl px-5 py-4 text-sm bg-[#1a1a1a] text-white border border-[#333]">
      <p className="font-bold mb-2 text-[#e4e1d9]">Year {label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="font-medium" style={{ color: p.color }}>
          {p.name}: {formatCurrency(p.value, true)}
        </p>
      ))}
    </div>
  );
}
