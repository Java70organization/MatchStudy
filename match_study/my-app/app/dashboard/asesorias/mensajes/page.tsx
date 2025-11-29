"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MessageSquare, Search, Plus, Send } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import {
  ChatMessage,
  ConversationSummary,
  Profile,
  fetchConversationsForUser,
  fetchMessages,
  fetchProfileByEmail,
  getOrCreateConversation,
  markConversationRead,
  sendMessage,
} from "@/lib/supabase/chat";

/* -------------------------------------------------------------------------- */
/*                               MODAL NUEVO CHAT                             */
/* -------------------------------------------------------------------------- */

type NewChatModalProps = {
  open: boolean;
  onClose: () => void;
  currentEmail: string;
  onConversationCreated: (conversationId: string) => void;
};

type UIUser = {
  email: string;
  nombres: string;
  apellidos: string;
  urlFoto: string | null;
};

function NewChatModal({
  open,
  onClose,
  currentEmail,
  onConversationCreated,
}: NewChatModalProps) {
  const [users, setUsers] = useState<UIUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [qs, setQs] = useState("");
  const [selected, setSelected] = useState<UIUser | null>(null);

  // Cargar TODOS los usuarios desde /api/users
  useEffect(() => {
    if (!open) return;

    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/users", {
          cache: "no-store",
          credentials: "include",
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Error cargando usuarios");

        const base = (json.data || []) as UIUser[];
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

        const normalized = base
          .filter(
            (u) =>
              u.email &&
              u.email.toLowerCase() !== currentEmail.toLowerCase()
          )
          .map((u) => {
            let foto = u.urlFoto;
            if (foto && !/^https?:\/\//i.test(foto)) {
              foto = `${supabaseUrl}/storage/v1/object/public/Profile/${foto}`;
            }
            return { ...u, urlFoto: foto };
          });

        setUsers(normalized);
      } catch (e) {
        console.error(e);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [open, currentEmail]);

  const filtered = useMemo(() => {
    const t = qs.trim().toLowerCase();
    if (!t) return users;
    return users.filter(
      (u) =>
        `${u.nombres} ${u.apellidos}`.toLowerCase().includes(t) ||
        u.email.toLowerCase().includes(t)
    );
  }, [users, qs]);

  const onConfirm = async () => {
    if (!selected) return;
    const conversationId = await getOrCreateConversation(
      currentEmail,
      selected.email
    );
    onConversationCreated(conversationId);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative z-50 w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950/95 p-4 shadow-2xl shadow-black/60">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Nuevo chat</h2>
          <button
            onClick={onClose}
            className="rounded-full px-2 py-1 text-xs text-slate-400 hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Buscador */}
        <div className="mb-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={qs}
              onChange={(e) => setQs(e.target.value)}
              placeholder="Buscar usuarios..."
              className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Lista de usuarios */}
        <div className="max-h-72 space-y-1 overflow-y-auto">
          {loading && (
            <p className="py-2 text-center text-xs text-slate-400">
              Cargando usuarios...
            </p>
          )}
          {!loading && filtered.length === 0 && (
            <p className="py-2 text-center text-xs text-slate-400">
              No se encontraron usuarios.
            </p>
          )}
          {!loading &&
            filtered.map((u) => (
              <button
                key={u.email}
                onClick={() => setSelected(u)}
                className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm ${
                  selected?.email === u.email
                    ? "bg-slate-800"
                    : "hover:bg-slate-900"
                }`}
              >
                {u.urlFoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={u.urlFoto}
                    alt={u.email}
                    className="h-8 w-8 rounded-full border border-slate-600 object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-xs font-semibold text-white">
                    {(u.nombres || u.email).charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm text-white">
                    {`${u.nombres} ${u.apellidos}`.trim() || u.email}
                  </div>
                  <div className="truncate text-[11px] text-slate-400">
                    {u.email}
                  </div>
                </div>
              </button>
            ))}
        </div>

        {/* Botones */}
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={!selected}
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
          >
            <Plus className="h-3 w-3" />
            Iniciar chat
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                           LISTA DE CONVERSACIONES                          */
/* -------------------------------------------------------------------------- */

type ChatListProps = {
  conversations: ConversationSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  search: string;
  onSearchChange: (v: string) => void;
  onNewChat: () => void;
};

function ChatList({
  conversations,
  selectedId,
  onSelect,
  search,
  onSearchChange,
  onNewChat,
}: ChatListProps) {
  const filtered = useMemo(() => {
    const t = search.trim().toLowerCase();
    if (!t) return conversations;
    return conversations.filter((c) => {
      const fullName = `${c.otherUser.nombres} ${c.otherUser.apellidos}`.trim();
      return (
        fullName.toLowerCase().includes(t) ||
        c.otherUser.email.toLowerCase().includes(t)
      );
    });
  }, [conversations, search]);

  return (
    <aside className="flex h-full flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
      <div className="mb-3 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar usuarios o chats..."
            className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <button
          onClick={onNewChat}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-purple-600 text-white hover:bg-purple-700"
          title="Nuevo chat"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="py-2 text-center text-xs text-slate-400">
            Sin conversaciones.
          </p>
        ) : (
          filtered.map((c) => {
            const fullName = `${c.otherUser.nombres} ${c.otherUser.apellidos}`.trim();
            const lastTime = c.lastMessageAt
              ? new Date(c.lastMessageAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "";
            return (
              <button
                key={c.id}
                onClick={() => onSelect(c.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left ${
                  c.id === selectedId
                    ? "bg-slate-800 border border-slate-700"
                    : "hover:bg-slate-900"
                }`}
              >
                {c.otherUser.urlFoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.otherUser.urlFoto}
                    alt={c.otherUser.email}
                    className="h-9 w-9 rounded-full border border-slate-600 object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-600 text-xs font-semibold text-white">
                    {(c.otherUser.nombres || c.otherUser.email)
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="truncate text-sm font-semibold text-white">
                      {fullName || c.otherUser.email}
                    </span>
                    <span className="ml-2 shrink-0 text-[10px] text-slate-400">
                      {lastTime}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <span className="line-clamp-1 text-[11px] text-slate-400">
                      {c.lastMessagePreview}
                    </span>
                    {c.unreadCount > 0 && (
                      <span className="ml-1 inline-flex min-w-[18px] justify-center rounded-full bg-purple-600 px-1 text-[10px] font-semibold text-white">
                        {c.unreadCount > 9 ? "9+" : c.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}

/* -------------------------------------------------------------------------- */
/*                               VISTA DE CHAT                                */
/* -------------------------------------------------------------------------- */

type ChatViewProps = {
  conversationId: string | null;
  currentEmail: string;
  otherUser: Profile | null;
};

function ChatView({ conversationId, currentEmail, otherUser }: ChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  // Cargar mensajes cuando cambie la conversación
  useEffect(() => {
    if (!conversationId) return;

    const load = async () => {
      setLoading(true);
      const data = await fetchMessages(conversationId);
      setMessages(data);
      setLoading(false);
      await markConversationRead(conversationId, currentEmail);
    };

    load();
  }, [conversationId, currentEmail]);

  // Realtime: escuchar nuevos mensajes de esta conversación
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages((prev) => [...prev, newMsg]);

          if (newMsg.sender_email !== currentEmail) {
            void markConversationRead(conversationId, currentEmail);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentEmail]);

  const send = async () => {
    if (!conversationId || !input.trim()) return;
    setSending(true);

    const m = await sendMessage(conversationId, currentEmail, input.trim());
    if (m) {
      setMessages((prev) => [...prev, m]);
      setInput("");
    }
    setSending(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  if (!conversationId || !otherUser) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40">
        <p className="text-sm text-slate-400">
          Selecciona un chat o crea uno nuevo para comenzar.
        </p>
      </div>
    );
  }

  const fullName = `${otherUser.nombres} ${otherUser.apellidos}`.trim();

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-800 bg-slate-900/60">
      {/* Header del chat */}
      <div className="flex items-center gap-3 border-b border-slate-800 px-4 py-3">
        {otherUser.urlFoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={otherUser.urlFoto}
            alt={otherUser.email}
            className="h-8 w-8 rounded-full border border-slate-600 object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-xs font-semibold text-white">
            {(otherUser.nombres || otherUser.email).charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <div className="text-sm font-semibold text-white">
            {fullName || otherUser.email}
          </div>
          <div className="text-[11px] text-slate-400">{otherUser.email}</div>
        </div>
      </div>

      {/* Mensajes */}
      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3 text-sm">
        {loading && (
          <p className="py-2 text-center text-xs text-slate-400">
            Cargando mensajes...
          </p>
        )}
        {!loading && messages.length === 0 && (
          <p className="py-2 text-center text-xs text-slate-400">
            Aún no hay mensajes. ¡Escribe el primero! ✨
          </p>
        )}
        {messages.map((m) => {
          const isMine = m.sender_email === currentEmail;
          const time = new Date(m.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          return (
            <div
              key={m.id}
              className={`flex w-full ${
                isMine ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs rounded-2xl px-3 py-2 text-[13px] shadow ${
                  isMine
                    ? "bg-purple-600 text-white rounded-br-sm"
                    : "bg-slate-800 text-slate-50 rounded-bl-sm"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">
                  {m.content}
                </p>
                <div className="mt-1 flex items-center justify-end gap-1">
                  <span className="text-[10px] opacity-70">{time}</span>
                  {isMine && (
                    <span className="text-[10px] opacity-70">
                      {m.read_at ? "Leído" : "Enviado"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="border-t border-slate-800 px-3 py-2">
        <div className="flex items-end gap-2">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Escribe tu mensaje..."
            className="max-h-32 flex-1 resize-none rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={send}
            disabled={sending || !input.trim()}
            className="inline-flex h-9 items-center justify-center rounded-xl bg-purple-600 px-3 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
          >
            <Send className="mr-1 h-4 w-4" />
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                             PÁGINA PRINCIPAL                               */
/* -------------------------------------------------------------------------- */

export default function MensajesPage() {
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationSummary[]>(
    []
  );
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedOtherUser, setSelectedOtherUser] = useState<Profile | null>(
    null
  );
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(false);

  const params = useSearchParams();

  // Obtener usuario actual
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentEmail(data.user?.email ?? null);
    });
  }, []);

  // Cargar conversaciones cuando tenemos el email
  useEffect(() => {
    if (!currentEmail) return;

    const load = async () => {
      setLoadingConvs(true);
      const data = await fetchConversationsForUser(currentEmail);
      setConversations(data);
      setLoadingConvs(false);

      const paramConv = params.get("c");
      if (paramConv) {
        const exists = data.find((c) => c.id === paramConv);
        if (exists) {
          setSelectedId(paramConv);
          setSelectedOtherUser(exists.otherUser);
        }
      }
    };

    load();
  }, [currentEmail, params]);

  // Realtime: refrescar lista de conversaciones cuando haya nuevos mensajes
  useEffect(() => {
    if (!currentEmail) return;

    const channel = supabase
      .channel(`conv-list:${currentEmail}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        async () => {
          const data = await fetchConversationsForUser(currentEmail);
          setConversations(data);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentEmail]);

  const handleSelectConversation = async (id: string) => {
    setSelectedId(id);
    const conv = conversations.find((c) => c.id === id);

    if (conv) {
      setSelectedOtherUser(conv.otherUser);
    } else if (currentEmail) {
      const { data: parts } = await supabase
        .from("conversation_participants")
        .select("user_email")
        .eq("conversation_id", id);

      if (parts && parts.length > 0) {
        const otherEmail =
          parts.find((p) => p.user_email !== currentEmail)?.user_email ??
          parts[0].user_email;
        const profile = await fetchProfileByEmail(otherEmail);
        if (profile) setSelectedOtherUser(profile);
      }
    }

    if (currentEmail) {
      await markConversationRead(id, currentEmail);
      const updated = await fetchConversationsForUser(currentEmail);
      setConversations(updated);
    }
  };

  const handleConversationCreated = async (conversationId: string) => {
    if (!currentEmail) return;
    const updated = await fetchConversationsForUser(currentEmail);
    setConversations(updated);
    await handleSelectConversation(conversationId);
  };

  return (
    <section className="flex h-[calc(100vh-4rem)] flex-col space-y-4">
      <div className="flex items-center gap-3">
        <MessageSquare className="h-8 w-8 text-purple-400" />
        <h1 className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-3xl font-extrabold text-transparent md:text-4xl">
          Mensajes
        </h1>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-12">
        <div className="md:col-span-4">
          {loadingConvs && (
            <div className="mb-2 text-xs text-slate-400">
              Cargando conversaciones...
            </div>
          )}
          <ChatList
            conversations={conversations}
            selectedId={selectedId}
            onSelect={handleSelectConversation}
            search={search}
            onSearchChange={setSearch}
            onNewChat={() => setNewChatOpen(true)}
          />
        </div>
        <div className="md:col-span-8">
          {currentEmail ? (
            <ChatView
              conversationId={selectedId}
              currentEmail={currentEmail}
              otherUser={selectedOtherUser}
            />
          ) : (
            <div className="flex h-full items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40">
              <p className="text-sm text-slate-400">Cargando usuario...</p>
            </div>
          )}
        </div>
      </div>

      {currentEmail && (
        <NewChatModal
          open={newChatOpen}
          onClose={() => setNewChatOpen(false)}
          currentEmail={currentEmail}
          onConversationCreated={handleConversationCreated}
        />
      )}
    </section>
  );
}
