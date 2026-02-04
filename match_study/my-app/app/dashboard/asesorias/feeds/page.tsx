"use client";

import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Rss,
  Search,
  Upload,
  MessageCircle,
  Heart,
  PlusCircle,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

/**
 * ✅ Feed con:
 * - Imágenes en posts y comentarios
 * - Like toggle (like/unlike) por usuario
 * - Comentarios con imágenes
 * - ✅ Tags tipo “chips” (se agregan con espacio/enter/coma)
 *
 * Requisitos BD (Supabase):
 * - feeds.images: text[]
 * - feeds.tags: text[]   ✅ (chips)
 * - feed_likes(feed_id, user_email) PK(feed_id,user_email)
 * - feed_comments(feed_id, user_email, texto, images text[], created_at)
 */

type Comment = {
  id: string;
  author: string;
  text: string;
  createdAt: string;
  images: string[];
};

type FeedRow = {
  id?: number;
  hora: string;
  usuario: string;
  materia: string;
  descripcion: string;
  universidad?: string | null;
  avatar_url?: string | null;

  // ✅ chips
  tags?: string[];

  images?: string[];
  likes?: number;
  likedByMe?: boolean;
  comments?: Comment[];
};

type DateRange = "all" | "today" | "7d" | "30d";
type SortBy = "recent" | "likes" | "comments";

type FeedLikeRow = {
  feed_id: number;
  user_email: string;
};

type FeedCommentRow = {
  id: number;
  feed_id: number;
  user_email: string;
  texto: string;
  images: string[] | null;
  created_at: string;
};

function timeAgo(dateStr: string) {
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `hace ${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `hace ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h}h`;
  const days = Math.floor(h / 24);
  return `hace ${days}d`;
}

function getPostKey(f: FeedRow) {
  return String(f.id ?? `${f.usuario}-${f.hora}`);
}

async function filesToBase64(files: FileList | null): Promise<string[]> {
  if (!files) return [];
  const arr = Array.from(files);
  const results = await Promise.all(
    arr.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        }),
    ),
  );
  return results;
}

async function safeInsertUserEvent(payload: {
  user_email: string;
  event_type: string;
  entity_type: "feed";
  entity_id: number;
  meta?: Record<string, unknown>;
}) {
  try {
    await supabase.from("user_events").insert({
      user_email: payload.user_email,
      event_type: payload.event_type,
      entity_type: payload.entity_type,
      entity_id: payload.entity_id,
      meta: payload.meta ?? {},
    });
  } catch {
    // ignore
  }
}

/** =======================
 *  ✅ TagInput (chips)
 *  ======================= */
function normalizeTag(raw: string) {
  const t = raw.trim().replace(/\s+/g, " ").toLowerCase();
  // letras/números/_/-
  return t.replace(/[^\p{L}\p{N}_-]+/gu, "");
}

function TagInput({
  value,
  onChange,
  placeholder = "Escribe y presiona espacio…",
  maxTags = 12,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
}) {
  const [input, setInput] = useState("");

  const addFromInput = (text: string) => {
    const n = normalizeTag(text);
    if (!n) return;
    if (value.includes(n)) return;
    if (value.length >= maxTags) return;
    onChange([...value, n]);
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2">
      <div className="flex flex-wrap gap-2">
        {value.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-1 rounded-full border border-slate-600 bg-slate-800 px-2 py-1 text-xs text-slate-100"
          >
            #{t}
            <button
              type="button"
              onClick={() => removeTag(t)}
              className="rounded-full p-0.5 hover:bg-slate-700"
              aria-label="Quitar"
              title="Quitar"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === " " || e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addFromInput(input);
              setInput("");
              return;
            }
            if (e.key === "Backspace" && input.length === 0 && value.length > 0) {
              onChange(value.slice(0, -1));
            }
          }}
          onBlur={() => {
            if (input.trim()) {
              addFromInput(input);
              setInput("");
            }
          }}
          placeholder={placeholder}
          className="min-w-[180px] flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
        />
      </div>

      <div className="mt-1 text-[11px] text-slate-400">
        {value.length}/{maxTags} etiquetas
      </div>
    </div>
  );
}

export default function FeedsPage() {
  const [items, setItems] = useState<FeedRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");

  // ✅ tags como chips
  const [form, setForm] = useState({
    materia: "",
    descripcion: "",
    tags: [] as string[],
  });

  const [newPostImages, setNewPostImages] = useState<string[]>([]);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dateRange, setDateRange] = useState<DateRange>("today");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortBy>("recent");

  const maxLen = 500;
  const [selfAvatarUrl, setSelfAvatarUrl] = useState<string | null>(null);
  const [selfInitial, setSelfInitial] = useState<string>("U");

  const [isNewPostOpen, setIsNewPostOpen] = useState(false);

  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [commentDrafts, setCommentDrafts] = useState<
    Record<string, { text: string; images: string[] }>
  >({});

  const baseFiltered = useMemo(() => {
    const t = q.trim().toLowerCase();
    const now = new Date();

    const inRange = (iso: string, range: DateRange) => {
      if (range === "all") return true;
      const d = new Date(iso);
      if (range === "today") return d.toDateString() === now.toDateString();
      if (range === "7d") {
        const past = new Date(now);
        past.setDate(now.getDate() - 7);
        return d >= past && d <= now;
      }
      if (range === "30d") {
        const past = new Date(now);
        past.setDate(now.getDate() - 30);
        return d >= past && d <= now;
      }
      return true;
    };

    return items.filter((it) => {
      const textMatch =
        !t ||
        it.materia.toLowerCase().includes(t) ||
        it.descripcion.toLowerCase().includes(t) ||
        (it.usuario ?? "").toLowerCase().includes(t) ||
        (it.universidad ?? "").toLowerCase().includes(t) ||
        (Array.isArray(it.tags) ? it.tags.join(" ").toLowerCase().includes(t) : false);

      const rangeMatch = inRange(it.hora, dateRange);

      const tags = Array.isArray(it.tags) ? it.tags : [];
      const tagMatch = tagFilter === "all" || tags.includes(tagFilter);

      return textMatch && rangeMatch && tagMatch;
    });
  }, [items, q, dateRange, tagFilter]);

  const visibleItems = useMemo(() => {
    const arr = [...baseFiltered];
    if (sortBy === "recent") {
      arr.sort((a, b) => new Date(b.hora).getTime() - new Date(a.hora).getTime());
    } else if (sortBy === "likes") {
      arr.sort(
        (a, b) =>
          (b.likes ?? 0) - (a.likes ?? 0) ||
          new Date(b.hora).getTime() - new Date(a.hora).getTime(),
      );
    } else if (sortBy === "comments") {
      arr.sort(
        (a, b) =>
          (b.comments?.length ?? 0) - (a.comments?.length ?? 0) ||
          new Date(b.hora).getTime() - new Date(a.hora).getTime(),
      );
    }
    return arr;
  }, [baseFiltered, sortBy]);

  const baseByText = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return items;
    return items.filter((it) => {
      const tagsText = Array.isArray(it.tags) ? it.tags.join(" ").toLowerCase() : "";
      return (
        it.materia.toLowerCase().includes(t) ||
        it.descripcion.toLowerCase().includes(t) ||
        (it.usuario ?? "").toLowerCase().includes(t) ||
        (it.universidad ?? "").toLowerCase().includes(t) ||
        tagsText.includes(t)
      );
    });
  }, [items, q]);

  const counts = useMemo(() => {
    const now = new Date();

    const inRange = (iso: string, range: DateRange) => {
      if (range === "all") return true;
      const d = new Date(iso);
      if (range === "today") return d.toDateString() === now.toDateString();
      if (range === "7d") {
        const past = new Date(now);
        past.setDate(now.getDate() - 7);
        return d >= past && d <= now;
      }
      if (range === "30d") {
        const past = new Date(now);
        past.setDate(now.getDate() - 30);
        return d >= past && d <= now;
      }
      return true;
    };

    return {
      all: baseByText.length,
      today: baseByText.filter((it) => inRange(it.hora, "today")).length,
      d7: baseByText.filter((it) => inRange(it.hora, "7d")).length,
      d30: baseByText.filter((it) => inRange(it.hora, "30d")).length,
    };
  }, [baseByText]);

  // ✅ Tags disponibles para filtro (de los posts cargados)
  const tagsAvailable = useMemo(() => {
    const set = new Set<string>();
    items.forEach((it) => {
      (it.tags ?? []).forEach((tg) => set.add(tg.toLowerCase()));
    });
    return Array.from(set).sort();
  }, [items]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: u } = await supabase.auth.getUser();
      const email = u?.user?.email ?? null;

      // ✅ IMPORTANTE: tu /api/feeds-with-users debe incluir "tags" y "images"
      const res = await fetch("/api/feeds-with-users", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Error cargando feeds");

      let feeds = (json.data as FeedRow[]) || [];
      feeds = feeds.map((it) => ({
        ...it,
        likes: 0,
        likedByMe: false,
        comments: [],
        images: Array.isArray(it.images) ? it.images : [],
        tags: Array.isArray(it.tags) ? it.tags : [],
      }));

      const ids = feeds.map((f) => f.id).filter((x): x is number => typeof x === "number");
      if (ids.length === 0) {
        setItems(feeds);
        return;
      }

      // Likes
      const { data: likesData, error: likesErr } = await supabase
        .from("feed_likes")
        .select("feed_id, user_email")
        .in("feed_id", ids);

      if (likesErr) throw likesErr;

      const likesRows = (likesData ?? []) as FeedLikeRow[];
      const likesCountMap = new Map<number, number>();
      const likedByMeSet = new Set<number>();

      likesRows.forEach((row) => {
        likesCountMap.set(row.feed_id, (likesCountMap.get(row.feed_id) ?? 0) + 1);
        if (email && row.user_email === email) likedByMeSet.add(row.feed_id);
      });

      // Comentarios
      const { data: commentsData, error: commentsErr } = await supabase
        .from("feed_comments")
        .select("id, feed_id, user_email, texto, images, created_at")
        .in("feed_id", ids)
        .order("created_at", { ascending: true });

      if (commentsErr) throw commentsErr;

      const commentRows = (commentsData ?? []) as FeedCommentRow[];
      const commentsMap = new Map<number, Comment[]>();

      commentRows.forEach((row) => {
        const c: Comment = {
          id: String(row.id),
          author: row.user_email,
          text: row.texto,
          createdAt: row.created_at,
          images: row.images ?? [],
        };
        const arr = commentsMap.get(row.feed_id) ?? [];
        arr.push(c);
        commentsMap.set(row.feed_id, arr);
      });

      feeds = feeds.map((f) => ({
        ...f,
        likes: likesCountMap.get(f.id!) ?? 0,
        likedByMe: likedByMeSet.has(f.id!),
        comments: commentsMap.get(f.id!) ?? [],
      }));

      setItems(feeds);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error cargando feeds");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    (async () => {
      try {
        const { data: u } = await supabase.auth.getUser();
        const nameInitial =
          (u?.user?.user_metadata?.full_name as string | undefined)?.charAt(0) ||
          u?.user?.email?.charAt(0) ||
          "U";
        setSelfInitial(nameInitial.toUpperCase());

        const res = await fetch("/api/profile-photo/signed", {
          cache: "no-store",
          credentials: "include",
        });
        if (res.ok) {
          const j = (await res.json()) as { url?: string };
          if (j?.url) setSelfAvatarUrl(j.url);
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  const onPost = async () => {
    try {
      setPosting(true);
      setError(null);

      if (!form.materia.trim() || !form.descripcion.trim()) {
        setError("Materia y descripción son requeridas");
        return;
      }

      const { data: u, error: authError } = await supabase.auth.getUser();
      if (authError || !u?.user?.email) throw new Error("No autorizado");

      const displayName =
        (u.user.user_metadata?.full_name as string | undefined) ||
        u.user.email.split("@")[0] ||
        "Usuario";

      const nowIso = new Date().toISOString();

      const { data, error } = await supabase
        .from("feeds")
        .insert({
          hora: nowIso,
          usuario: displayName,
          materia: form.materia.trim(),
          descripcion: form.descripcion.trim(),
          email: u.user.email,
          tags: form.tags, // ✅ chips
          images: newPostImages,
        })
        .select()
        .single();

      if (error) throw error;

      await safeInsertUserEvent({
        user_email: u.user.email,
        event_type: "feed_create",
        entity_type: "feed",
        entity_id: data.id as number,
        meta: { tags: (data as { tags?: unknown }).tags ?? [] },
      });

      const newRow: FeedRow = {
        id: data.id as number,
        hora: data.hora as string,
        usuario: data.usuario as string,
        materia: data.materia as string,
        descripcion: data.descripcion as string,
        tags: Array.isArray((data as { tags?: unknown }).tags) ? ((data as { tags?: string[] }).tags ?? []) : [],
        images: ((data as { images?: string[] | null }).images ?? []) as string[],
        likes: 0,
        likedByMe: false,
        comments: [],
      };

      setItems((prev) => [newRow, ...prev]);
      setForm({ materia: "", descripcion: "", tags: [] });
      setNewPostImages([]);
      setIsNewPostOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error publicando");
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (feed: FeedRow) => {
    if (!feed.id) return;
    try {
      const { data: u, error: authError } = await supabase.auth.getUser();
      if (authError || !u?.user?.email) throw new Error("No autorizado");
      const email = u.user.email;

      const already = !!feed.likedByMe;

      if (already) {
        const { error: delErr } = await supabase
          .from("feed_likes")
          .delete()
          .eq("feed_id", feed.id)
          .eq("user_email", email);
        if (delErr) throw delErr;
      } else {
        const { error: insErr } = await supabase.from("feed_likes").insert({
          feed_id: feed.id,
          user_email: email,
        });
        if (insErr) throw insErr;
      }

      await safeInsertUserEvent({
        user_email: email,
        event_type: already ? "feed_unlike" : "feed_like",
        entity_type: "feed",
        entity_id: feed.id,
      });

      setItems((prev) =>
        prev.map((p) =>
          p.id === feed.id
            ? {
                ...p,
                likedByMe: !already,
                likes: Math.max(0, (p.likes ?? 0) + (already ? -1 : 1)),
              }
            : p,
        ),
      );
    } catch (e) {
      console.error("Error like toggle:", e);
    }
  };

  const handleToggleComments = (key: string) => {
    setOpenComments((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCommentTextChange = (key: string, text: string) => {
    setCommentDrafts((prev) => ({
      ...prev,
      [key]: { ...(prev[key] || { text: "", images: [] }), text },
    }));
  };

  const handleCommentImagesChange = async (
    key: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const images = await filesToBase64(e.target.files);
    setCommentDrafts((prev) => ({
      ...prev,
      [key]: { ...(prev[key] || { text: "", images: [] }), images },
    }));
  };

  const handleAddComment = async (feed: FeedRow) => {
    if (!feed.id) return;

    const key = getPostKey(feed);
    const draft = commentDrafts[key];
    if (!draft || !draft.text.trim()) return;

    try {
      const { data: u, error: authError } = await supabase.auth.getUser();
      if (authError || !u?.user?.email) throw new Error("No autorizado");

      const email = u.user.email;
      const displayName =
        (u.user.user_metadata?.full_name as string | undefined) ||
        email.split("@")[0] ||
        "Usuario";

      const { data, error } = await supabase
        .from("feed_comments")
        .insert({
          feed_id: feed.id,
          user_email: email,
          texto: draft.text.trim(),
          images: draft.images,
        })
        .select()
        .single();

      if (error) throw error;

      await safeInsertUserEvent({
        user_email: email,
        event_type: "feed_comment",
        entity_type: "feed",
        entity_id: feed.id,
      });

      const newComment: Comment = {
        id: String((data as { id: number }).id),
        author: displayName,
        text: (data as { texto: string }).texto,
        createdAt: (data as { created_at: string }).created_at,
        images: ((data as { images?: string[] | null }).images ?? []) as string[],
      };

      setItems((prev) =>
        prev.map((p) =>
          p.id === feed.id ? { ...p, comments: [...(p.comments ?? []), newComment] } : p,
        ),
      );

      setCommentDrafts((prev) => ({
        ...prev,
        [key]: { text: "", images: [] },
      }));
    } catch (e) {
      console.error("Error agregando comentario:", e);
    }
  };

  const handleNewPostImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const images = await filesToBase64(e.target.files);
    setNewPostImages(images);
  };

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Rss className="h-8 w-8 text-purple-400" />
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Feed
          </h1>
        </div>
        <button
          onClick={() => setIsNewPostOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-purple-500/30 hover:bg-purple-700 transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          + Nueva publicación
        </button>
      </div>

      {/* Buscador + filtros */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-col gap-3">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por materia, descripción, usuario, tags..."
              className="w-full rounded-xl border border-slate-700 bg-slate-900/70 py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex flex-wrap gap-2 text-xs md:text-sm">
            {(
              [
                { k: "today", label: "Hoy", n: counts.today },
                { k: "7d", label: "7 días", n: counts.d7 },
                { k: "30d", label: "30 días", n: counts.d30 },
                { k: "all", label: "Todos", n: counts.all },
              ] as const
            ).map((t) => (
              <button
                key={t.k}
                onClick={() => setDateRange(t.k)}
                className={`rounded-full border px-3 py-1.5 ${
                  dateRange === t.k
                    ? "border-purple-500 bg-purple-600 text-white"
                    : "border-slate-700 bg-slate-900/60 text-slate-300 hover:bg-slate-800"
                }`}
              >
                {t.label} <span className="opacity-70">({t.n ?? 0})</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 md:w-80">
          <div className="flex items-center gap-2">
            <span className="w-16 text-xs text-slate-400">Tag</span>
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Todos</option>
              {tagsAvailable.map((t) => (
                <option key={t} value={t}>
                  #{t}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-16 text-xs text-slate-400">Ordenar</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="recent">Más recientes</option>
              <option value="likes">Más likes</option>
              <option value="comments">Más comentadas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista */}
      <div className="grid gap-4">
        {loading ? (
          <p className="text-slate-400">Cargando...</p>
        ) : visibleItems.length === 0 ? (
          <p className="text-slate-400">No hay publicaciones que coincidan con los filtros.</p>
        ) : (
          visibleItems.map((f) => {
            const key = getPostKey(f);
            const commentsOpen = !!openComments[key];
            const draft = commentDrafts[key] || { text: "", images: [] };

            return (
              <article
                key={key}
                className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg shadow-black/40"
              >
                <div className="flex items-start gap-3">
                  {f.avatar_url ? (
                    <Image
                      src={f.avatar_url}
                      alt="avatar"
                      width={40}
                      height={40}
                      unoptimized
                      className="h-10 w-10 rounded-full border border-slate-600 object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700 text-sm font-semibold text-slate-200">
                      {(f.usuario || "U").charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-semibold text-white">{f.usuario || "Usuario"}</span>
                          <span className="text-xs text-slate-400">{timeAgo(f.hora)}</span>
                        </div>
                        {typeof f.universidad === "string" && f.universidad && (
                          <p className="text-xs text-slate-400">{f.universidad}</p>
                        )}
                      </div>
                    </div>

                    <h3 className="mt-1 text-sm font-semibold text-white">{f.materia}</h3>
                    <p className="whitespace-pre-wrap text-sm text-slate-200">{f.descripcion}</p>

                    {/* ✅ TAGS */}
                    {Array.isArray(f.tags) && f.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {f.tags.map((t) => (
                          <span
                            key={t}
                            className="rounded-full border border-slate-700 bg-slate-800 px-2 py-1 text-[11px] text-slate-200"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* ✅ IMÁGENES DEL POST */}
                    {Array.isArray(f.images) && f.images.length > 0 && (
                      <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3">
                        {f.images.map((img, idx) => (
                          <div
                            key={`${key}-img-${idx}`}
                            className="overflow-hidden rounded-xl border border-slate-700/70 bg-slate-800"
                          >
                            <Image
                              src={img}
                              alt={`Imagen ${idx + 1}`}
                              width={800}
                              height={800}
                              unoptimized
                              className="h-40 w-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Acciones */}
                    <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                      <button
                        onClick={() => handleLike(f)}
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 transition-colors ${
                          f.likedByMe
                            ? "bg-pink-600/25 text-pink-200"
                            : "bg-slate-800/80 text-slate-200 hover:bg-slate-700/80"
                        }`}
                        title={f.likedByMe ? "Quitar like" : "Dar like"}
                      >
                        <Heart
                          className={`h-4 w-4 ${f.likedByMe ? "fill-pink-400 text-pink-400" : ""}`}
                        />
                        <span>{f.likes ?? 0}</span>
                      </button>

                      <button
                        onClick={() => handleToggleComments(key)}
                        className="inline-flex items-center gap-1 rounded-full bg-slate-800/80 px-3 py-1 hover:bg-slate-700/80"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>{f.comments?.length ?? 0} comentarios</span>
                      </button>
                    </div>

                    {/* Comentarios */}
                    {commentsOpen && (
                      <div className="mt-3 space-y-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-3">
                        <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
                          {f.comments && f.comments.length > 0 ? (
                            f.comments.map((c) => (
                              <div
                                key={c.id}
                                className="rounded-xl border border-slate-800 bg-slate-900 p-2 text-xs text-slate-100"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-semibold">{c.author}</span>
                                  <span className="text-[10px] text-slate-500">
                                    {timeAgo(c.createdAt)}
                                  </span>
                                </div>
                                <p className="mt-1 whitespace-pre-wrap">{c.text}</p>

                                {Array.isArray(c.images) && c.images.length > 0 && (
                                  <div className="mt-2 grid grid-cols-2 gap-2">
                                    {c.images.map((img, idx) => (
                                      <div
                                        key={`${c.id}-img-${idx}`}
                                        className="overflow-hidden rounded-lg border border-slate-700/70 bg-slate-800"
                                      >
                                        <Image
                                          src={img}
                                          alt={`Comentario imagen ${idx + 1}`}
                                          width={600}
                                          height={600}
                                          unoptimized
                                          className="h-24 w-full object-cover"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-slate-500">Sé el primero en comentar ✨</p>
                          )}
                        </div>

                        <div className="space-y-2 border-t border-slate-800 pt-2">
                          <textarea
                            rows={2}
                            value={draft.text}
                            onChange={(e) => handleCommentTextChange(key, e.target.value)}
                            placeholder="Escribe un comentario..."
                            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />
                          <div className="flex items-center justify-between gap-2">
                            <label className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-slate-800 px-3 py-1 text-[11px] text-slate-200 hover:bg-slate-700">
                              <ImageIcon className="h-3 w-3" />
                              Imágenes
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                multiple
                                onChange={(e) => handleCommentImagesChange(key, e)}
                              />
                            </label>

                            <button
                              onClick={() => handleAddComment(f)}
                              disabled={!draft.text.trim()}
                              className="inline-flex items-center gap-1 rounded-full bg-purple-600 px-3 py-1 text-[11px] font-medium text-white hover:bg-purple-700 disabled:opacity-50"
                            >
                              <Upload className="h-3 w-3" />
                              Comentar
                            </button>
                          </div>

                          {draft.images.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {draft.images.map((img, idx) => (
                                <div
                                  key={`${key}-preview-${idx}`}
                                  className="h-10 w-10 overflow-hidden rounded-lg border border-slate-700"
                                >
                                  <Image
                                    src={img}
                                    alt="preview"
                                    width={80}
                                    height={80}
                                    unoptimized
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Modal nueva publicación */}
      {isNewPostOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="absolute inset-0" onClick={() => !posting && setIsNewPostOpen(false)} />
          <div className="relative z-10 w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-950/95 p-5 shadow-2xl shadow-black/60">
            <button
              className="absolute right-3 top-3 rounded-full bg-slate-900 p-1 text-slate-400 hover:bg-slate-800"
              onClick={() => !posting && setIsNewPostOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-4 flex items-center gap-2">
              {selfAvatarUrl ? (
                <Image
                  src={selfAvatarUrl}
                  alt="mi avatar"
                  width={36}
                  height={36}
                  unoptimized
                  className="h-9 w-9 rounded-full border border-slate-600 object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700 text-sm font-semibold text-slate-200">
                  {selfInitial}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-white">Nueva publicación</p>
                <p className="text-xs text-slate-400">
                  Comparte dudas, tips o recursos con la comunidad ✨
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Materia o título"
                value={form.materia}
                onChange={(e) => setForm((f) => ({ ...f, materia: e.target.value }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              <TagInput
                value={form.tags}
                onChange={(tags) => setForm((f) => ({ ...f, tags }))}
                placeholder="Ej: calculo integrales examen (espacio para agregar)"
                maxTags={12}
              />

              <textarea
                placeholder="¿Qué quieres compartir?"
                value={form.descripcion}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    descripcion: e.target.value.slice(0, maxLen),
                  }))
                }
                className="w-full min-h-[120px] rounded-2xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                maxLength={maxLen}
              />

              <div className="flex items-center justify-between text-xs text-slate-400">
                <label className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-slate-800 px-3 py-1 text-[11px] text-slate-200 hover:bg-slate-700">
                  <ImageIcon className="h-3 w-3" />
                  Añadir imágenes
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleNewPostImagesChange}
                  />
                </label>
                <span>
                  {form.descripcion.length}/{maxLen}
                </span>
              </div>

              {newPostImages.length > 0 && (
                <div className="mt-1 grid grid-cols-3 gap-2">
                  {newPostImages.map((img, idx) => (
                    <div
                      key={`new-img-${idx}`}
                      className="h-24 overflow-hidden rounded-xl border border-slate-700 bg-slate-800"
                    >
                      <Image
                        src={img}
                        alt="preview"
                        width={600}
                        height={600}
                        unoptimized
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {error && <p className="pt-1 text-xs text-red-400">{error}</p>}

              <div className="mt-3 flex justify-end gap-2">
                <button
                  onClick={() => !posting && setIsNewPostOpen(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={onPost}
                  disabled={posting || !form.descripcion.trim() || !form.materia.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
                >
                  <Upload className="h-4 w-4" />
                  {posting ? "Publicando..." : "Publicar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
