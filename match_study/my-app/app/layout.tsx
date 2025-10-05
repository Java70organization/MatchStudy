// app/layout.tsx (ROOT LAYOUT)
import "./globals.css"; // tu Tailwind/global CSS

export const metadata = {
  title: "MatchStudy",
  description: "Plataforma de asesorías",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-950 text-white antialiased">
        {children}
      </body>
    </html>
  );
}
