// components/dashboard/NotificationBell.tsx
"use client";

import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useMessageNotifications } from "../../lib/hooks/useMessageNotifications"; 
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";

export default function NotificationBell() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);

  const { notifications, unreadCount, loading, markNotificationBatchAsRead } =
    useMessageNotifications(email);

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // cerrar al hacer click fuera
  useEffect(() => {
    const handler = (ev: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(ev.target as Node)
      ) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const toggle = () => setOpen((prev) => !prev);

  const handleOpenConversationFromNotification = async (id: number) => {
    const notif = notifications.find((n) => n.id === id);
    if (!notif || !notif.conversation_id) return;
    await markNotificationBatchAsRead([notif]);
    // Redirigir a la pantalla de mensajes con query ?c=<conversation_id>
    window.location.href = `/asesorias/mensajes?c=${notif.conversation_id}`;
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 text-slate-200 shadow-sm hover:bg-slate-800 transition-colors"
        aria-label="Notificaciones"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-pink-500 px-1 text-[10px] font-semibold text-white shadow-md">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 origin-top-right rounded-2xl border border-slate-800 bg-slate-950/95 shadow-2xl shadow-black/50 backdrop-blur-lg">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-white">
                Notificaciones
              </p>
              <p className="text-[11px] text-slate-400">
                {loading
                  ? "Cargando..."
                  : unreadCount === 0
                  ? "Todo al día ✨"
                  : `${unreadCount} sin leer`}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markNotificationBatchAsRead(notifications)}
                className="text-[11px] font-medium text-purple-400 hover:text-purple-300"
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto py-1">
            {notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-slate-500">
                No tienes notificaciones nuevas.
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleOpenConversationFromNotification(n.id)}
                  className="flex w-full flex-col items-start gap-1 px-4 py-3 text-left text-xs text-slate-100 hover:bg-slate-900/90"
                >
                  <span className="font-semibold text-white">
                    {n.title}
                  </span>
                  {n.body && (
                    <span className="text-[11px] text-slate-300 line-clamp-2">
                      {n.body}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-500">
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </button>
              ))
            )}
          </div>

          <div className="border-t border-slate-800 px-4 py-2 text-[11px] text-right">
            <Link
              href="/asesorias/mensajes"
              className="text-purple-400 hover:text-purple-300"
            >
              Ir a mensajes
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
