// lib/hooks/useMessageNotifications.ts
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  fetchUnreadNotifications,
  MessageNotification,
} from "@/lib/supabase/chat";

export function useMessageNotifications(currentEmail: string | null) {
  const [notifications, setNotifications] = useState<MessageNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!currentEmail) return;

    const load = async () => {
      setLoading(true);
      const data = await fetchUnreadNotifications(currentEmail);
      setNotifications(data);
      setLoading(false);
    };

    load();

    // Subscripción en tiempo real a notificaciones nuevas
    const channel = supabase
      .channel(`notifications:${currentEmail}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_email=eq.${currentEmail}`,
        },
        (payload) => {
          const newNotif = (payload as any)?.new as MessageNotification | undefined;
          if (newNotif) setNotifications((prev) => [newNotif, ...prev]);
        },
      )
      .subscribe();

    // Opcional: refresco periódico como fallback
    const interval = setInterval(load, 15000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [currentEmail]);

  const unreadCount = notifications.length;

  const markNotificationBatchAsRead = async (
    notificationsToRead: MessageNotification[]
  ) => {
    if (!currentEmail || notificationsToRead.length === 0) return;
    const ids = notificationsToRead.map((n) => n.id);
    const now = new Date().toISOString();

    await supabase
      .from("notifications")
      .update({ read_at: now })
      .in("id", ids)
      .eq("user_email", currentEmail);

    setNotifications((prev) =>
      prev.filter((n) => !ids.includes(n.id))
    );
  };

  return {
    notifications,
    unreadCount,
    loading,
    markNotificationBatchAsRead,
  };
}
