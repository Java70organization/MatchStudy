export default function AsesoriasPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl md:text-4xl font-extrabold">Asesorías</h1>
      <p className="text-slate-300">Explora tutores y materias disponibles.</p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg hover:border-purple-500 transition">
            <h3 className="font-semibold">Materia {i + 1}</h3>
            <p className="text-sm text-slate-300">Descripción breve de la asesoría.</p>
            <a href="/sesiones" className="mt-3 inline-flex rounded-lg bg-purple-600 px-3 py-2 text-sm font-medium hover:bg-purple-700">Agendar</a>
          </div>
        ))}
      </div>
    </section>
  );
}