export default function CalendarioPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl md:text-4xl font-extrabold">Calendario</h1>
      <p className="text-slate-300">Conecta tu calendario para ver y gestionar sesiones.</p>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
        <div className="h-64 grid place-items-center text-slate-400">
          (Aquí va tu calendario/agenda)
        </div>
      </div>
    </section>
  );
}
