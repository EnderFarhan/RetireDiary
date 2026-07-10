export function EtfCard({ ticker, name, expense, description, isMain }: { ticker: string; name: string; expense: string; description: string; isMain: boolean }) {
  return (
    <div className={`rounded-2xl p-5 border-2 ${isMain ? 'border-[#16a34a] bg-[#f0fdf4]' : 'border-[#e4e1d9] bg-white'}`}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-3xl font-black tracking-tight text-[#1a1a1a]">{ticker}</span>
        {isMain && <span className="text-[9px] font-bold uppercase tracking-widest text-[#16a34a] border border-[#16a34a]/30 rounded-full px-2 py-0.5">Recommended</span>}
      </div>
      <div className="text-xs font-bold text-[#5c5c5c] mb-1">{name}</div>
      <div className="text-[10px] font-black text-[#16a34a] mb-3 uppercase tracking-widest">Expense ratio: {expense}/yr</div>
      <p className="text-sm text-[#5c5c5c] leading-relaxed">{description}</p>
    </div>
  );
}
