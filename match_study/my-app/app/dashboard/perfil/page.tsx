"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";
import { checkUserProfile, DBUser } from "@/lib/supabase/user";
import ProfilePhotoUploader from "./ProfilePhotoUploader";
import {
  User as UserIcon,
  Mail,
  Phone,
  GraduationCap,
  CalendarDays,
  BadgeCheck,
  Edit3,
  Save,
  XCircle,
  Loader2,
} from "lucide-react";

export default function PerfilPage() {
  const [userProfile, setUserProfile] = useState<DBUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    telefono: "",
    universidad: "",
    displayName: "",
  });

  // Estado para tutor
  const [isTutor, setIsTutor] = useState(false);
  const [tutorSkills, setTutorSkills] = useState<Array<{tag_id: number, weight: number, tag_name: string}>>([]);
  const [skillsText, setSkillsText] = useState("");
  const [availableTags, setAvailableTags] = useState<Array<{id: number, name: string}>>([]);

  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const handleImageError = (imageUrl: string) => {
    setFailedImages(prev => new Set(prev).add(imageUrl));
  };

  useEffect(() => {
    const loadUserProfile = async () => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setError("No hay usuario autenticado");
        window.location.href = "/auth/login";
        return;
      }

      setUserEmail(user.email || "");

      if (user.email) {
        const profile = await checkUserProfile(user.email);

        if (profile) {
          setUserProfile(profile);

          const authDisplay =
            (user.user_metadata?.full_name as string | undefined) ||
            `${profile.nombres || ""} ${profile.apellidos || ""}`.trim();

          setForm({
            nombres: profile.nombres || "",
            apellidos: profile.apellidos || "",
            telefono: profile.telefono || "",
            universidad: profile.universidad || "",
            displayName: authDisplay || "",
          });

          // Cargar datos de tutor
          loadTutorData();

          if (profile.urlFoto) {
            try {
              const res = await fetch("/api/profile-photo/signed", {
                cache: "no-store",
                credentials: "include",
              });
              const data = await res.json();
              setSignedUrl(res.ok ? data.url ?? null : null);
            } catch {
              setSignedUrl(null);
            }
          } else {
            setSignedUrl(null);
          }
        } else {
          setError(
            "No se encontró el perfil del usuario. Completa tu perfil primero.",
          );
        }
      }
    } catch (err) {
      console.error("Error cargando perfil:", err);
      setError("Error al cargar el perfil");
    } finally {
      setLoading(false);
    }
  };

  loadUserProfile();
}, []);

  // Función para cargar datos de tutor
  const loadTutorData = async () => {
    try {
      // Cargar tags disponibles
      const tagsResponse = await fetch("/api/tags");
      const tagsData = await tagsResponse.json();
      if (tagsResponse.ok) {
        setAvailableTags(tagsData.tags || []);
      }

      // Cargar estado de tutor
      const tutorResponse = await fetch("/api/tutor-status");
      const tutorData = await tutorResponse.json();
      if (tutorResponse.ok) {
        setIsTutor(tutorData.is_tutor || false);
      }

      // Cargar skills de tutor
      const skillsResponse = await fetch("/api/tutor-skills");
      const skillsData = await skillsResponse.json();
      if (skillsResponse.ok) {
        const skills = (skillsData.skills || []) as Array<{tag_id: number, weight: number, tag_name: string}>;
        setTutorSkills(skills);
        // Convertir a formato legible para edición (solo nombres)
        const formattedSkills = skills.map((s) => s.tag_name).filter(Boolean).join(', ');
        setSkillsText(formattedSkills);
      }
    } catch (error) {
      console.error("Error cargando datos de tutor:", error);
    }
  };

  /* -------------------------------- LOAD / ERROR ------------------------------- */

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <UserIcon className="h-8 w-8 text-purple-400" />
          <h1 className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-3xl font-extrabold text-transparent md:text-4xl">
            Mi Perfil
          </h1>
        </div>
        <div className="flex items-center justify-center py-16">
          <div className="space-y-4 text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
            <p className="text-sm text-slate-300">Cargando perfil…</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <UserIcon className="h-8 w-8 text-purple-400" />
          <h1 className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-3xl font-extrabold text-transparent md:text-4xl">
            Mi Perfil
          </h1>
        </div>

        <div className="rounded-2xl border border-red-500/40 bg-red-900/15 p-6">
          <p className="text-sm text-red-200">{error}</p>
          {error.includes("Completa tu perfil") && (
            <button
              onClick={() => (window.location.href = "/auth/completar-perfil")}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-700"
            >
              <BadgeCheck className="h-4 w-4" />
              Completar Perfil
            </button>
          )}
        </div>
      </section>
    );
  }

  /* -------------------------------- HANDLERS ----------------------------------- */

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveMsg(null);
      const res = await fetch("/api/update-user-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          nombres: form.nombres,
          apellidos: form.apellidos,
          telefono: form.telefono,
          universidad: form.universidad,
          displayName: form.displayName,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error al guardar");

      setUserProfile((prev) =>
        prev
          ? {
              ...prev,
              nombres: data.data?.nombres ?? form.nombres,
              apellidos: data.data?.apellidos ?? form.apellidos,
              telefono: data.data?.telefono ?? form.telefono,
              universidad: data.data?.universidad ?? form.universidad,
            }
          : prev,
      );

      // Guardar estado de tutor y skills
      await saveTutorStatus();

      // Recargar datos de tutor para mostrar skills actualizadas
      await loadTutorData();

      setSaveMsg("Cambios guardados correctamente");
      setEditing(false);

      // Notificar a la topbar/sidebar del nuevo displayName
      if (typeof window !== "undefined" && form.displayName.trim()) {
        window.dispatchEvent(
          new CustomEvent("display-name-updated", {
            detail: { full_name: form.displayName.trim() },
          }),
        );
      }
    } catch (e) {
      setSaveMsg(
        e instanceof Error ? e.message : "Error al guardar los cambios",
      );
    } finally {
      setSaving(false);
    }
  };

  // Función para guardar estado de tutor
  const saveTutorStatus = async () => {
    // Guardar estado de tutor
    const tutorRes = await fetch("/api/tutor-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ is_tutor: isTutor }),
    });

    const tutorData = await tutorRes.json();
    if (!tutorRes.ok) {
      throw new Error(tutorData?.error || "Error guardando estado de tutor");
    }

    // Guardar skills si es tutor
    if (isTutor && skillsText.trim()) {
      const skillsArray = skillsText
        .split(',')
        .map(skill => ({
          tag_name: skill.trim(),
          weight: 5,
        }))
        .filter(skill => skill.tag_name.length > 0);

      const skillsRes = await fetch("/api/tutor-skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ skills: skillsArray }),
      });

      const skillsData = await skillsRes.json();
      if (!skillsRes.ok) {
        throw new Error(skillsData?.error || "Error guardando skills");
      }
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setSaveMsg(null);
    if (userProfile) {
      const fallbackDisplay = `${userProfile.nombres || ""} ${
        userProfile.apellidos || ""
      }`.trim();
      setForm({
        nombres: userProfile.nombres || "",
        apellidos: userProfile.apellidos || "",
        telefono: userProfile.telefono || "",
        universidad: userProfile.universidad || "",
        displayName: fallbackDisplay,
      });
    }
    // Recargar datos de tutor
    if (userEmail) {
      loadTutorData();
    }
    // Resetear skills text
    const formattedSkills = tutorSkills.map((s) => s.tag_name).filter(Boolean).join(', ');
    setSkillsText(formattedSkills);
  };

  const createdLabel = userProfile?.createdAt
    ? new Date(userProfile.createdAt).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "No disponible";

  /* ----------------------------------- UI -------------------------------------- */

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <UserIcon className="h-8 w-8 text-purple-400" />
            <h1 className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-3xl font-extrabold text-transparent md:text-4xl">
              Mi Perfil
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-300">
            Gestiona tu información personal y académica.
          </p>
        </div>

        <div className="rounded-full border border-emerald-500/40 bg-emerald-900/20 px-4 py-1.5 text-xs font-semibold text-emerald-300">
          <span className="inline-flex items-center gap-2">
            <BadgeCheck className="h-4 w-4" />
            Perfil completo
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Columna izquierda: resumen y foto */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/40">
            <div className="flex flex-col items-center gap-4 text-center">
              {/* Avatar */}
              {signedUrl && !failedImages.has(signedUrl) ? (
                <Image
                  src={signedUrl}
                  alt="Foto de perfil"
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-full border border-purple-500/60 object-cover shadow-lg shadow-purple-900/50"
                  onError={() => handleImageError(signedUrl)}
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-3xl font-bold text-white shadow-lg shadow-purple-900/50">
                  {(userProfile?.nombres || "U").charAt(0)}
                  {(userProfile?.apellidos || "").charAt(0)}
                </div>
              )}

              {/* Nombre + correo */}
              <div>
                <p className="text-lg font-semibold text-white">
                  {form.displayName ||
                    `${form.nombres} ${form.apellidos}`.trim() ||
                    userEmail}
                </p>
                <div className="mt-1 inline-flex items-center gap-2 rounded-full bg-slate-800/80 px-3 py-1 text-xs text-slate-300">
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{userProfile?.email || userEmail}</span>
                </div>
              </div>

              {/* Badges rápidos */}
              <div className="mt-3 grid w-full gap-2 text-left text-xs text-slate-300">
                {isTutor && (
                  <div className="flex items-center gap-2 rounded-xl bg-purple-900/70 px-3 py-2">
                    <GraduationCap className="h-4 w-4 text-purple-400" />
                    <div className="flex-1">
                      <p className="text-[11px] uppercase tracking-wide text-slate-500">
                        Rol
                      </p>
                      <p className="text-sm font-medium text-purple-300">
                        Tutor
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 rounded-xl bg-slate-900/70 px-3 py-2">
                  <GraduationCap className="h-4 w-4 text-purple-400" />
                  <div className="flex-1">
                    <p className="text-[11px] uppercase tracking-wide text-slate-500">
                      Universidad
                    </p>
                    <p className="text-sm">
                      {form.universidad || "No especificada"}
                    </p>
                  </div>
                </div>

                {isTutor && tutorSkills.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 rounded-xl bg-emerald-900/70 px-3 py-2">
                      <BadgeCheck className="h-4 w-4 text-emerald-400" />
                      <div className="flex-1">
                        <p className="text-[11px] uppercase tracking-wide text-slate-500">
                          Skills
                        </p>
                        <p className="text-sm text-emerald-300">
                          {tutorSkills.length} especialidades
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-emerald-800/60 bg-emerald-950/20 p-3">
                      <p className="mb-2 text-[11px] uppercase tracking-wide text-emerald-200">
                        Skills agregadas
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {tutorSkills.map((skill) => (
                          <span
                            key={skill.tag_id}
                            className="rounded-full border border-emerald-700/80 bg-emerald-900/80 px-3 py-1 text-xs font-medium text-emerald-100"
                          >
                            {skill.tag_name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div className="flex items-center gap-2 rounded-xl bg-slate-900/70 px-3 py-2">
                  <Phone className="h-4 w-4 text-purple-400" />
                  <div className="flex-1">
                    <p className="text-[11px] uppercase tracking-wide text-slate-500">
                      Teléfono
                    </p>
                    <p className="text-sm">
                      {form.telefono || "No especificado"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-slate-900/70 px-3 py-2">
                  <CalendarDays className="h-4 w-4 text-purple-400" />
                  <div className="flex-1">
                    <p className="text-[11px] uppercase tracking-wide text-slate-500">
                      Miembro desde
                    </p>
                    <p className="text-xs">{createdLabel}</p>
                  </div>
                </div>
              </div>

              {/* Uploader */}
              <div className="mt-4 w-full rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-left">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                  Actualizar foto
                </p>
                <ProfilePhotoUploader
                  onUploaded={(r) => {
                    setUserProfile((prev) =>
                      prev ? { ...prev, urlFoto: r.path } : prev,
                    );
                    setSignedUrl(r.signedUrl ?? null);
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha: formulario detallado */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/40">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Información personal
                </h2>
                <p className="text-xs text-slate-400">
                  Edita tus datos básicos y cómo te verán en MatchStudy.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {!editing ? (
                  <button
                    onClick={() => {
                      setSaveMsg(null);
                      setEditing(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-100 transition-colors hover:bg-slate-700"
                  >
                    <Edit3 className="h-4 w-4" />
                    Editar
                  </button>
                ) : (
                  <>
                    <button
                      disabled={saving}
                      onClick={handleSave}
                      className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      {saving ? "Guardando…" : "Guardar"}
                    </button>
                    <button
                      disabled={saving}
                      onClick={handleCancel}
                      className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-100 transition-colors hover:bg-slate-700 disabled:opacity-60"
                    >
                      <XCircle className="h-4 w-4" />
                      Cancelar
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Nombres / Apellidos */}
              <div className="space-y-1">
                <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Nombres
                </label>
                <input
                  type="text"
                  value={form.nombres}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, nombres: e.target.value }))
                  }
                  readOnly={!editing}
                  className={`w-full rounded-lg border px-3 py-2 text-sm text-white outline-none ${
                    editing
                      ? "border-slate-600 bg-slate-900 focus:ring-2 focus:ring-purple-500"
                      : "cursor-not-allowed border-slate-800 bg-slate-900/80 text-slate-300"
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Apellidos
                </label>
                <input
                  type="text"
                  value={form.apellidos}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, apellidos: e.target.value }))
                  }
                  readOnly={!editing}
                  className={`w-full rounded-lg border px-3 py-2 text-sm text-white outline-none ${
                    editing
                      ? "border-slate-600 bg-slate-900 focus:ring-2 focus:ring-purple-500"
                      : "cursor-not-allowed border-slate-800 bg-slate-900/80 text-slate-300"
                  }`}
                />
              </div>

              {/* Display name */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Nombre a mostrar en MatchStudy
                </label>
                <input
                  type="text"
                  value={form.displayName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, displayName: e.target.value }))
                  }
                  readOnly={!editing}
                  placeholder="Nombre a mostrar en MatchStudy"
                  className={`w-full rounded-lg border px-3 py-2 text-sm text-white outline-none ${
                    editing
                      ? "border-slate-600 bg-slate-900 focus:ring-2 focus:ring-purple-500"
                      : "cursor-not-allowed border-slate-800 bg-slate-900/80 text-slate-300"
                  }`}
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Email
                </label>
                <input
                  type="email"
                  value={userProfile?.email || userEmail}
                  readOnly
                  className="w-full cursor-not-allowed rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm text-slate-300"
                />
              </div>

              {/* Teléfono */}
              <div className="space-y-1">
                <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={form.telefono}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, telefono: e.target.value }))
                  }
                  readOnly={!editing}
                  placeholder="No especificado"
                  className={`w-full rounded-lg border px-3 py-2 text-sm text-white outline-none ${
                    editing
                      ? "border-slate-600 bg-slate-900 focus:ring-2 focus:ring-purple-500"
                      : "cursor-not-allowed border-slate-800 bg-slate-900/80 text-slate-300"
                  }`}
                />
              </div>

              {/* Universidad */}
              <div className="space-y-1">
                <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Universidad
                </label>
                <input
                  type="text"
                  value={form.universidad}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, universidad: e.target.value }))
                  }
                  readOnly={!editing}
                  placeholder="No especificada"
                  className={`w-full rounded-lg border px-3 py-2 text-sm text-white outline-none ${
                    editing
                      ? "border-slate-600 bg-slate-900 focus:ring-2 focus:ring-purple-500"
                      : "cursor-not-allowed border-slate-800 bg-slate-900/80 text-slate-300"
                  }`}
                />
              </div>

              {/* Es tutor - Switch */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  ¿Eres tutor?
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => editing && setIsTutor(!isTutor)}
                    disabled={!editing}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isTutor ? "bg-purple-600" : "bg-slate-600"
                    } ${editing ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isTutor ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <span className="text-sm text-slate-300">
                    {isTutor ? "Sí, soy tutor" : "No, soy estudiante"}
                  </span>
                </div>
              </div>

              {/* Skills */}
              {isTutor && (
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Skills / Especialidades
                  </label>
                  <textarea
                    value={skillsText}
                    onChange={(e) => editing && setSkillsText(e.target.value)}
                    readOnly={!editing}
                    placeholder="Ingresa tus skills separados por comas&#10;Ej: Python, JavaScript, C++, React"
                    rows={3}
                    className={`w-full rounded-lg border px-3 py-2 text-sm text-white outline-none ${
                      editing
                        ? "border-slate-600 bg-slate-900 focus:ring-2 focus:ring-purple-500"
                        : "cursor-not-allowed border-slate-800 bg-slate-900/80 text-slate-300"
                    }`}
                  />
                  <p className="text-xs text-slate-500">
                    {editing
                      ? `Ingresa tus skills separados por comas. Disponibles: ${availableTags.map(t => t.name).join(', ') || 'cargando...'}`
                      : `Tienes ${tutorSkills.length} especialidades: ${tutorSkills.map(s => s.tag_name).filter(Boolean).join(', ') || 'ninguna'}`}
                  </p>
                </div>
              )}

              {/* Fecha registro */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Fecha de registro
                </label>
                <input
                  type="text"
                  value={createdLabel}
                  readOnly
                  className="w-full cursor-not-allowed rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm text-slate-300"
                />
              </div>
            </div>

            {/* Mensaje de guardado */}
            {saveMsg && (
              <p
                className={`mt-4 text-sm ${
                  saveMsg.includes("guardados")
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                {saveMsg}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
