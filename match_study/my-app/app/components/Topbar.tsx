"use client";
import { Menu } from "lucide-react";
import Image from "next/image";
import { useState } from "react";


export default function Topbar({ onToggle }: { onToggle: () => void }) {
const [pulse, setPulse] = useState(false);
return (
<header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-800 bg-slate-950/70 px-4 backdrop-blur">
<button
onClick={() => {
onToggle();
setPulse(true);
setTimeout(() => setPulse(false), 200);
}}
aria-label="Abrir navegación"
className={`rounded-md p-2 text-slate-200 hover:bg-slate-800 focus:outline-none ${
pulse ? "ring-2 ring-purple-500" : ""
} lg:hidden`}
>
<Menu className="h-5 w-5" />
</button>


<div className="ml-auto flex items-center gap-3">
<div className="text-sm text-slate-300">Hola, Usuario</div>
<Image
src="/avatar-placeholder.png"
alt="avatar"
width={28}
height={28}
className="rounded-full border border-slate-700"
/>
</div>
</header>
);
}
