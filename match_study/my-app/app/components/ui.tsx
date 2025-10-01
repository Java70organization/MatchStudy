export function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      {children}
    </div>
  );
}
export function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href}
       className="inline-flex items-center rounded-lg border border-slate-800 bg-slate-800/60 px-3 py-2 text-sm text-slate-200 hover:border-purple-500 hover:bg-slate-800">
      {label}
    </a>
  );
}