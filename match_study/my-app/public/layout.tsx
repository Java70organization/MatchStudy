"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";


export default function DashboardLayout({
children,
}: {
children: React.ReactNode;
}) {
const [open, setOpen] = useState(false);


return (
<div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 text-white">
<div className="flex">
<Sidebar open={open} setOpen={setOpen} />
<div className="flex-1 lg:ml-72">
<Topbar onToggle={() => setOpen((v) => !v)} />
<main className="p-4 md:p-8">
{children}
</main>
</div>
</div>
</div>
);
}
