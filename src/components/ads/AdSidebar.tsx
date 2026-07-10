import React from 'react';

export default function AdSidebar() {
  return (
    <div className="w-full h-full flex flex-col items-center gap-8">
      {/* 
        This is a placeholder for the actual Ad network code.
        In production with Google AdSense, you would replace this with your vertical ad unit:
        <ins className="adsbygoogle"
             style={{ display: 'block' }}
             data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
             data-ad-slot="XXXXXXXXXX"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
        <script>
             (adsbygoogle = window.adsbygoogle || []).push({});
        </script>
      */}
      <div className="sticky top-24 w-full h-[600px] bg-[#e4e1d9]/30 border-2 border-dashed border-[#e4e1d9] rounded-xl flex items-center justify-center flex-col relative p-4 text-center">
        <span className="text-[10px] font-bold text-[#9a9a9a] uppercase tracking-widest absolute top-2 right-3">Advertisement</span>
        <span className="text-sm font-black text-[#5c5c5c]">Support this free calculator</span>
        <span className="text-[11px] font-medium text-[#9a9a9a] mt-1">Ad space placeholder</span>
      </div>
    </div>
  );
}
