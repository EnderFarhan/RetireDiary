export function SectionHeader({ badge, title, color = 'green' }: { badge: string; title: string; color?: 'green' | 'red' | 'charcoal' }) {
  const colors = {
    green: 'text-[#16a34a] border-[#16a34a]/30',
    red: 'text-[#ef4444] border-[#ef4444]/30',
    charcoal: 'text-[#5c5c5c] border-[#e4e1d9]',
  };
  return (
    <div className="relative z-[60]">
      <div className={`inline-flex items-center gap-2 px-3 py-1 text-[10px] font-bold uppercase tracking-widest border rounded-full mb-3 ${colors[color]}`}>
        {badge}
      </div>
      <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-[#1a1a1a]">{title}</h2>
    </div>
  );
}
