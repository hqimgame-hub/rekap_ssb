"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, School, FileBarChart, LogOut, Sun, Moon, HelpCircle } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function AdminHeader() {
    const pathname = usePathname();
    const router = useRouter();
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        setIsDark(document.documentElement.classList.contains('dark'));
    }, []);

    const toggleTheme = () => {
        const next = !isDark;
        setIsDark(next);
        if (next) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    const handleLogout = () => {
        document.cookie = "admin_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
        router.push("/admin/login");
    };

    const navItems = [
        { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
        { name: "Kelas", href: "/admin/classes", icon: School },
        { name: "Siswa", href: "/admin/students", icon: Users },
        { name: "Rekap", href: "/admin/recap", icon: FileBarChart },
    ];

    return (
        <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-card-border px-4 py-1 transition-all">
            <div className="max-w-7xl mx-auto flex items-center justify-between h-14 sm:h-16">
                <div className="flex items-center gap-4 sm:gap-8 h-full overflow-hidden">
                    <Link href="/admin/dashboard" className="flex items-center gap-2 group shrink-0">
                        <div className="relative w-8 h-8 rounded-xl overflow-hidden">
                            <Image src="/logo.png" alt="Logo SSB" fill className="object-contain" />
                        </div>
                        <span className="font-extrabold text-[13px] tracking-tight hidden md:inline-block uppercase">
                            Admin <span className="text-primary font-black">SSB</span>
                        </span>
                    </Link>

                    <nav className="flex items-center h-full gap-1 overflow-x-auto no-scrollbar mask-fade-right">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-[11px] sm:text-[12px] font-bold transition-all whitespace-nowrap group shrink-0 ${isActive
                                        ? "text-primary bg-primary/5 shadow-sm shadow-primary/5"
                                        : "text-muted hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
                                        }`}
                                >
                                    <Icon size={16} className={isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"} />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="flex items-center gap-2 pl-4 shrink-0">
                    <Link
                        href="/admin/help"
                        className="p-2 sm:p-2.5 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all active:scale-95"
                        title="Pusat Bantuan"
                    >
                        <HelpCircle size={18} />
                    </Link>
                    <button
                        onClick={toggleTheme}
                        className="p-2 sm:p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95"
                        title="Change Theme"
                    >
                        {isDark ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                    <div className="w-px h-5 bg-card-border mx-1 hidden sm:block" />
                    <button
                        onClick={handleLogout}
                        className="p-2 sm:p-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all active:scale-95"
                        title="Logout"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </header>
    );
}
