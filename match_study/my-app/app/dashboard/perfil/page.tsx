import Link from "next/link";

export default function PerfilPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl md:text-4xl font-extrabold">Perfil</h1>
      <p className="text-slate-300">
        Gestiona tu información personal y académica.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Información Personal */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Información Personal</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Nombre completo
              </label>
              <input
                type="text"
                placeholder="Tu nombre completo"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="tu@email.com"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Universidad
              </label>
              <input
                type="text"
                placeholder="Tu universidad"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Carrera
              </label>
              <input
                type="text"
                placeholder="Tu carrera"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Estadísticas</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
              <span className="text-slate-300">Sesiones completadas</span>
              <span className="text-2xl font-bold text-purple-400">0</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
              <span className="text-slate-300">Rating promedio</span>
              <span className="text-2xl font-bold text-yellow-400">⭐ N/A</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
              <span className="text-slate-300">Tiempo total estudiado</span>
              <span className="text-2xl font-bold text-green-400">0h</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
              <span className="text-slate-300">Materias favoritas</span>
              <span className="text-sm text-slate-400">No definidas</span>
            </div>
          </div>
        </div>

        {/* Biografía */}
        <div className="md:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Biografía</h3>
          <textarea
            placeholder="Cuéntanos un poco sobre ti, tus intereses académicos y qué te gusta estudiar..."
            rows={4}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          />
        </div>

        {/* Acciones */}
        <div className="md:col-span-2 flex gap-4">
          <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
            Guardar cambios
          </button>
          <Link href="/dashboard/configuracion">
            <button className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-medium">
              Configuración avanzada
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
