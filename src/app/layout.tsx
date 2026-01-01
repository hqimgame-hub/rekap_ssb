import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "SSB SMPN 32 SBY - Sarapan Sehat Bersama",
    description: "Aplikasi pencatatan menu sarapan sehat harian siswa SMPN 32 Surabaya",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="id">
            <body>
                <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-slate-50 to-emerald-50" />
                <main className="min-h-screen">
                    {children}
                </main>
            </body>
        </html>
    );
}
