export default function SesionesPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl md:text-4xl font-extrabold">Mis sesiones</h1>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
        <ul className="space-y-3 text-sm text-slate-300">
          <li className="opacity-70">Sin sesiones agendadas.</li>
        </ul>
      </div>
    </section>
  );
}
