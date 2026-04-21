import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Obtener todos los tags disponibles
    const { data: tags, error } = await supabase
      .from("tags")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: `Error obteniendo tags: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ tags: tags || [] }, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo tags:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
