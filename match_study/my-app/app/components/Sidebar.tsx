"use client";
>
<div className="flex items-center justify-between gap-2 px-2 py-1">
<Link href="/lobby" className="text-xl font-extrabold tracking-tight">
MatchStudy
</Link>
<button
onClick={() => setOpen(false)}
className="lg:hidden rounded-md px-2 py-1 text-slate-300 hover:bg-slate-800"
aria-label="Cerrar navegación"
>
✕
</button>
</div>


<nav className="mt-4 space-y-1">
{NAV.map(({ href, label, icon: Icon }) => {
const active = pathname === href;
return (
<Link
key={href}
href={href}
className={
"flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition " +
(active
? "bg-purple-600 text-white"
: "text-slate-300 hover:bg-slate-800 hover:text-white")
}
>
<Icon className="h-4 w-4" />
<span>{label}</span>
</Link>
);
})}
</nav>


<div className="mt-auto absolute bottom-4 left-0 right-0 px-4">
<form action="/api/auth/signout" method="post">
<button
type="submit"
className="w-full flex items-center justify-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-slate-200 hover:bg-slate-700"
>
<LogOut className="h-4 w-4" />
Cerrar sesión
</button>
</form>
</div>
</aside>
</>
);
}
