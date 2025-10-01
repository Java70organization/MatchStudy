export default function LobbyPage() {
return (
<section className="space-y-6">
<h1 className="text-3xl md:text-4xl font-extrabold">Lobby</h1>
<p className="text-slate-300 max-w-2xl">
Bienvenido 👋 Aquí verás un resumen rápido de tu actividad: próximas asesorías,
mensajes recientes y atajos a lo más usado.
</p>


<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
<Card title="Próximas asesorías">
<ul className="space-y-2 text-sm text-slate-300">
<li>No tienes sesiones hoy.</li>
<li className="opacity-60">Conecta tu calendario para ver más.</li>
</ul>
</Card>
<Card title="Mensajes">
<div className="text-sm text-slate-300">No hay mensajes nuevos.</div>
</Card>
<Card title="Accesos rápidos">
<div className="flex flex-wrap gap-2">
<QuickLink href="/asesorias" label="Buscar asesorías" />
<QuickLink href="/perfil" label="Ver perfil" />
<QuickLink href="/perfil/configuracion" label="Editar perfil" />
<QuickLink href="/pagos" label="Pagos" />
</div>
</Card>
</div>
</section>
);
}


function Card({ title, children }: { title: string; children: React.ReactNode }) {
return (
<div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
<h2 className="mb-3 text-lg font-semibold">{title}</h2>
{children}
</div>
);
}


function QuickLink({ href, label }: { href: string; label: string }) {
return (
<a
href={href}
