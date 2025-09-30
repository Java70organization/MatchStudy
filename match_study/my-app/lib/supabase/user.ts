export type DBUser = {
  id: number;
  authId: string;
  email: string;
  displayName: string;
  userType: string; // ej. "student" | "tutor"
  createdAt: string;
  photoUrl: string | null;
  university: string | null;
};

/**
 * Crea (si no existe) la fila en public.User para el usuario autenticado.
 */
/*export async function ensureUserRow(
  params: {
    authId: string;
    email: string;
    displayName: string;
    userType: string;
    photoUrl?: string | null;
    university?: string | null;
  }
): Promise<DBUser> {
  const { supabase } = await import("./client");

  // ¿Ya existe?
  const { data: existing, error: selErr } = await supabase
    .from("User")
    .select("*")
    .eq("authId", params.authId)
    .maybeSingle();

  if (selErr) throw selErr;
  if (existing) return existing as DBUser;

  const { data, error } = await supabase
    .from("User")
    .insert({
      authId: params.authId,
      email: params.email,
      displayName: params.displayName,
      userType: params.userType,
      createdAt: new Date().toISOString(),
      photoUrl: params.photoUrl ?? null,
      university: params.university ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as DBUser;
}
  */
 // /lib/user.ts
export async function ensureUserRow(params: {
  email: string;
  displayName: string;
  userType: string;
  photoUrl?: string | null;
  university?: string | null;
}) {
  const { supabase } = await import("@/lib/supabase/client");

  // si ya existe, regresa
  const { data: me, error: selErr } = await supabase
    .from("User")
    .select("*")
    .eq("email", params.email)
    .maybeSingle();
  if (selErr) throw selErr;
  if (me) return me;

  // insert SIN authId: el trigger lo asigna
  const { data, error } = await supabase
    .from("User")
    .insert({
      email: params.email,
      displayName: params.displayName,
      userType: params.userType,
      createdAt: new Date().toISOString(),
      photoUrl: params.photoUrl ?? null,
      university: params.university ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
