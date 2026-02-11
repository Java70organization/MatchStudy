import { supabase } from "./client";

export type Profile = {
  email: string;
  nombres: string;
  apellidos: string;
  urlFoto: string | null;
};

export type ConversationSummary = {
  id: string;
  otherUser: Profile;
  lastMessagePreview: string;
  lastMessageAt: string | null;
  unreadCount: number;
};

export type ChatMessage = {
  id: string;
  conversation_id: string;
  sender_email: string;
  content: string;
  created_at: string;
  read_at: string | null;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

function normalizePhoto(urlFoto: string | null): string | null {
  if (!urlFoto) return null;
  if (/^https?:\/\//i.test(urlFoto)) return urlFoto;
  return `${supabaseUrl}/storage/v1/object/public/Profile/${urlFoto}`;
}

function errMsg(e: unknown): string {
  if (!e) return "Error desconocido";
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;

  if (typeof e === "object") {
    const anyE = e as any;
    const parts: string[] = [];
    if (anyE.message) parts.push(String(anyE.message));
    if (anyE.details) parts.push(String(anyE.details));
    if (anyE.hint) parts.push(String(anyE.hint));
    if (anyE.code) parts.push(`code: ${String(anyE.code)}`);
    if (parts.length) return parts.join(" | ");
    try {
      return JSON.stringify(e);
    } catch {
      return "Error (objeto no serializable)";
    }
  }

  return String(e);
}

export async function fetchProfileByEmail(email: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("usuarios")
    .select("email,nombres,apellidos,urlFoto")
    .eq("email", email)
    .maybeSingle();

  if (error || !data) return null;

  return {
    email: data.email,
    nombres: data.nombres,
    apellidos: data.apellidos,
    urlFoto: normalizePhoto(data.urlFoto),
  };
}

/**
 * Crea conversación 1-1 via RPC (server-side).
 */
export async function getOrCreateConversation(
  currentEmail: string,
  otherEmail: string
): Promise<string> {
  // Primero intenta encontrar una conversación existente
  const { data: existing, error: exErr } = await supabase
    .from("conversation_participants")
    .select("conversation_id, user_email")
    .in("user_email", [currentEmail, otherEmail]);

  if (!exErr && existing && existing.length > 0) {
    const grouped = existing.reduce<Record<string, Set<string>>>((acc, row) => {
      if (!acc[row.conversation_id]) acc[row.conversation_id] = new Set();
      acc[row.conversation_id].add(row.user_email);
      return acc;
    }, {});

    const convId = Object.entries(grouped).find(([, set]) => {
      return set.size === 2 && set.has(currentEmail) && set.has(otherEmail);
    })?.[0];

    if (convId) return convId;
  }

  // Si no existe, crea por RPC
  const { data, error } = await supabase.rpc("create_conversation_1to1", {
    p_other_email: otherEmail,
  });

  if (error || !data) {
    throw new Error(`No se pudo crear la conversación: ${errMsg(error)}`);
  }

  return data as string;
}

export async function fetchConversationsForUser(
  currentEmail: string
): Promise<ConversationSummary[]> {
  const { data: participantRows, error } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_email", currentEmail);

  if (error || !participantRows) return [];

  const conversationIds = participantRows.map((r) => r.conversation_id as string);
  if (conversationIds.length === 0) return [];

  const results: ConversationSummary[] = [];

  await Promise.all(
    conversationIds.map(async (conversationId) => {
      // ✅ obtener participantes via RPC (para poder ver al otro)
      const { data: parts, error: partsErr } = await supabase.rpc("get_participants", {
        p_conversation_id: conversationId,
      });

      if (partsErr || !parts || parts.length === 0) return;

      const otherEmail =
        (parts as any[]).find((p) => p.user_email !== currentEmail)?.user_email ??
        (parts as any[])[0].user_email;

      const profile = await fetchProfileByEmail(otherEmail);
      const otherProfile: Profile =
        profile ?? { email: otherEmail, nombres: "", apellidos: "", urlFoto: null };

      const { data: lastMsg } = await supabase
        .from("messages")
        .select("content, created_at")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const { count: unreadCount } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("conversation_id", conversationId)
        .is("read_at", null)
        .neq("sender_email", currentEmail);

      results.push({
        id: conversationId,
        otherUser: otherProfile,
        lastMessagePreview: lastMsg?.content ?? "Sin mensajes",
        lastMessageAt: lastMsg?.created_at ?? null,
        unreadCount: unreadCount ?? 0,
      });
    })
  );

  return results.sort((a, b) => {
    const ta = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
    const tb = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
    return tb - ta;
  });
}

export async function fetchMessages(conversationId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("id,conversation_id,sender_email,content,created_at,read_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return data as ChatMessage[];
}

/**
 * Envía un mensaje.
 * NOTA: trigger actualiza conversation + notificaciones.
 */
export async function sendMessage(
  conversationId: string,
  senderEmail: string,
  content: string
): Promise<ChatMessage | null> {
  const { data, error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, sender_email: senderEmail, content })
    .select("id,conversation_id,sender_email,content,created_at,read_at")
    .single();

  if (error || !data) return null;
  return data as ChatMessage;
}

export async function markConversationRead(conversationId: string, currentEmail: string) {
  const now = new Date().toISOString();

  await supabase
    .from("messages")
    .update({ read_at: now })
    .eq("conversation_id", conversationId)
    .neq("sender_email", currentEmail)
    .is("read_at", null);

  await supabase
    .from("notifications")
    .update({ read_at: now })
    .eq("conversation_id", conversationId)
    .eq("user_email", currentEmail)
    .is("read_at", null);
}

export type MessageNotification = {
  id: number;
  conversation_id: string | null;
  message_id: string | null;
  title: string;
  body: string | null;
  created_at: string;
};

export async function fetchUnreadNotifications(
  currentEmail: string
): Promise<MessageNotification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("id,conversation_id,message_id,title,body,created_at")
    .eq("user_email", currentEmail)
    .is("read_at", null)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !data) return [];
  return data as MessageNotification[];
}
