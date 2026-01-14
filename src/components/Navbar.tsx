"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut, User } from "lucide-react";
import { useTheme, themes, Theme } from "@/hooks/use-theme";
import PushNotificationToggle from "@/components/PushNotificationToggle";
import { useAuth } from "@/context/AuthContext";

const navLinks = [
    { name: "Characters", href: "/" },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();
    const { isLoggedIn, user, profile, logout } = useAuth();

    const currentTheme = themes.find((t) => t.value === theme) || themes[0];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center group">
                        <span className="font-bold text-xl text-gradient-flame">
                            DemonSlayer
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${pathname === link.href
                                    ? "text-primary bg-primary/10"
                                    : "text-foreground/60 hover:text-foreground hover:bg-white/10"
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Theme Selector & Auth Buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        {/* Theme Selector */}
                        <div className="relative">
                            <select
                                value={theme}
                                onChange={(e) => setTheme(e.target.value as Theme)}
                                className="appearance-none px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white cursor-pointer focus:outline-none focus:border-gold/50"
                            >
                                {themes.map((t) => (
                                    <option key={t.value} value={t.value} className="bg-black text-white">
                                        {t.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {/* Push Notification Toggle */}
                        {/* TODO: Re-enable when push notifications work */}
                        {/* <PushNotificationToggle /> */}
                        {isLoggedIn ? (
                            <>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5">
                                    <User className="w-4 h-4 text-green-400" />
                                    <span className="text-sm text-foreground">{profile?.displayName || user?.username}</span>
                                </div>
                                <button
                                    onClick={logout}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="px-4 py-2 text-sm font-medium text-foreground/60 hover:text-foreground transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-4 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white hover:opacity-90 transition-opacity"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Theme & Menu Button */}
                    <div className="md:hidden flex items-center gap-2">
                        <select
                            value={theme}
                            onChange={(e) => setTheme(e.target.value as Theme)}
                            className="appearance-none px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-white cursor-pointer focus:outline-none"
                        >
                            {themes.map((t) => (
                                <option key={t.value} value={t.value} className="bg-black text-white">
                                    {t.label}
                                </option>
                            ))}
                        </select>
                        <button
                            className="p-2 text-white/60 hover:text-white"
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="md:hidden py-4 border-t border-white/10">
                        <div className="flex flex-col gap-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`px-4 py-3 rounded-lg font-medium transition-all ${pathname === link.href
                                        ? "text-primary bg-primary/10"
                                        : "text-foreground/60 hover:text-foreground hover:bg-white/10"
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="flex gap-2 mt-4 px-4">
                                {isLoggedIn ? (
                                    <>
                                        <div className="flex-1 py-2 text-center rounded-lg bg-white/5 text-green-400">
                                            {profile?.displayName || user?.username}
                                        </div>
                                        <button
                                            onClick={() => { logout(); setIsOpen(false); }}
                                            className="flex-1 py-2 text-center rounded-lg bg-red-500/20 text-red-400 font-medium"
                                        >
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            className="flex-1 py-2 text-center rounded-lg bg-white/5 text-foreground/80 hover:bg-white/10 transition-colors"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            href="/register"
                                            className="flex-1 py-2 text-center rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-foreground font-bold"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Register
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
