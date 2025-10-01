export default function PerfilPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl md:text-4xl font-extrabold">Perfil</h1>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="font-semibold mb-2">Información</h3>
            <p className="text-slate-300 text-sm">Nombre, universidad, bio…</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Estadísticas</h3>
            <p className="text-slate-300 text-sm">Sesiones completadas, rating…</p>
          </div>
        </div>
      </div>
    </section>
  );
}
