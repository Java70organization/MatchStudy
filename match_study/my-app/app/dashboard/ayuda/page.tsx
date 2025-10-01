export default function AyudaPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl md:text-4xl font-extrabold">Ayuda</h1>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
        <p className="text-slate-300">¿Necesitas soporte? Revisa las preguntas frecuentes o contáctanos.</p>
        <ul className="mt-3 list-disc pl-5 text-slate-300 text-sm">
          <li>¿Cómo agendar una asesoría?</li>
          <li>¿Cómo configurar mi perfil?</li>
        </ul>
      </div>
    </section>
  );
}
