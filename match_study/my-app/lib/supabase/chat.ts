// lib/supabase/chat.ts
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

// Convierte la ruta de foto en URL pública si es necesario
function normalizePhoto(urlFoto: string | null): string | null {
  if (!urlFoto) return null;
  if (/^https?:\/\//i.test(urlFoto)) return urlFoto;
  return `${supabaseUrl}/storage/v1/object/public/Profile/${urlFoto}`;
}

/**
 * Obtiene el perfil de un usuario por email desde la tabla `usuarios`.
 */
export async function fetchProfileByEmail(
  email: string,
): Promise<Profile | null> {
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
 * Devuelve (o crea) una conversación 1 a 1 entre dos usuarios por email.
 */
export async function getOrCreateConversation(
  currentEmail: string,
  otherEmail: string,
): Promise<string> {
  // 1) buscar conversación existente que tenga SÓLO estos 2 participantes
  const { data: existing, error: exErr } = await supabase
    .from("conversation_participants")
    .select("conversation_id, user_email")
    .in("user_email", [currentEmail, otherEmail]);

  if (!exErr && existing && existing.length > 0) {
    // Agrupar por conversation_id y ver las que tienen exactamente estos 2
    const grouped = existing.reduce<Record<string, Set<string>>>((acc, row) => {
      if (!acc[row.conversation_id]) {
        acc[row.conversation_id] = new Set();
      }
      acc[row.conversation_id].add(row.user_email);
      return acc;
    }, {});

    // IMPORTANT: aquí quitamos el "_" no usado usando elisión en el destructuring
    const convId = Object.entries(grouped).find(([, set]) => {
      return (
        set.size === 2 &&
        set.has(currentEmail) &&
        set.has(otherEmail)
      );
    })?.[0];

    if (convId) return convId;
  }

  // 2) Crear conversación nueva
  const { data: conv, error: convErr } = await supabase
    .from("conversations")
    .insert({})
    .select("id")
    .single();

  if (convErr || !conv) {
    throw convErr || new Error("No se pudo crear la conversación");
  }

  const conversationId = conv.id as string;

  const { error: partErr } = await supabase
    .from("conversation_participants")
    .insert([
      { conversation_id: conversationId, user_email: currentEmail },
      { conversation_id: conversationId, user_email: otherEmail },
    ]);

  if (partErr) throw partErr;

  return conversationId;
}

/**
 * Obtiene todas las conversaciones del usuario y calcula último mensaje y no leídos.
 * Esta versión es correcta pero no súper optimizada (usa varias consultas).
 */
export async function fetchConversationsForUser(
  currentEmail: string,
): Promise<ConversationSummary[]> {
  // 1) conversaciones donde participa el usuario
  const { data: participantRows, error } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_email", currentEmail);

  if (error || !participantRows) return [];

  const conversationIds = participantRows.map(
    (r) => r.conversation_id as string,
  );
  if (conversationIds.length === 0) return [];

  const results: ConversationSummary[] = [];

  // 2) Para cada conversación: otros participantes, último mensaje, no leídos
  await Promise.all(
    conversationIds.map(async (conversationId) => {
      // participantes (solo emails)
      const { data: parts } = await supabase
        .from("conversation_participants")
        .select("user_email")
        .eq("conversation_id", conversationId);

      if (!parts || parts.length === 0) return;

      // tomar “el otro” email (para 1 a 1); si hubiera más, usamos el primero
      const otherEmail =
        parts.find((p) => p.user_email !== currentEmail)?.user_email ??
        parts[0].user_email;

      // cargar perfil desde tabla usuarios
      const profile = await fetchProfileByEmail(otherEmail);
      const otherProfile: Profile =
        profile ?? {
          email: otherEmail,
          nombres: "",
          apellidos: "",
          urlFoto: null,
        };

      // último mensaje
      const { data: lastMsg } = await supabase
        .from("messages")
        .select("content, created_at")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      // contador de no leídos
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
    }),
  );

  // ordenar por fecha del último mensaje
  return results.sort((a, b) => {
    const ta = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
    const tb = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
    return tb - ta;
  });
}

/**
 * Obtiene todos los mensajes de una conversación.
 */
export async function fetchMessages(
  conversationId: string,
): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("id,conversation_id,sender_email,content,created_at,read_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return data as ChatMessage[];
}

/**
 * Envía un mensaje y actualiza la conversación + genera notificaciones.
 */
export async function sendMessage(
  conversationId: string,
  senderEmail: string,
  content: string,
): Promise<ChatMessage | null> {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_email: senderEmail,
      content,
    })
    .select("id,conversation_id,sender_email,content,created_at,read_at")
    .single();

  if (error || !data) return null;

  // Actualizar last_message_at y preview
  await supabase
    .from("conversations")
    .update({
      last_message_at: data.created_at,
      last_message_preview: data.content,
    })
    .eq("id", conversationId);

  // Notificaciones: una por cada participante que no sea el emisor
  const { data: participants } = await supabase
    .from("conversation_participants")
    .select("user_email")
    .eq("conversation_id", conversationId);

  if (participants) {
    const toNotify = participants
      .map((p) => p.user_email as string)
      .filter((email) => email !== senderEmail);

    if (toNotify.length > 0) {
      await supabase.from("notifications").insert(
        toNotify.map((email) => ({
          user_email: email,
          conversation_id: conversationId,
          message_id: data.id,
          title: "Nuevo mensaje",
          body: content.slice(0, 80),
        })),
      );
    }
  }

  return data as ChatMessage;
}

/**
 * Marca como leídos todos los mensajes de una conversación para el usuario actual.
 */
export async function markConversationRead(
  conversationId: string,
  currentEmail: string,
) {
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

/**
 * Notificaciones: obtiene las basadas en mensajes no leídos.
 */
export type MessageNotification = {
  id: number;
  conversation_id: string | null;
  message_id: string | null;
  title: string;
  body: string | null;
  created_at: string;
};

export async function fetchUnreadNotifications(
  currentEmail: string,
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
