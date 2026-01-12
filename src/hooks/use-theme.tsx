"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Theme = "dark" | "light" | "flame" | "ocean";

export const themes: { value: Theme; label: string; icon: string; color: string }[] = [
    { value: "dark", label: "Dark", icon: "🌙", color: "#1a1a1a" },
    { value: "light", label: "Light", icon: "☀️", color: "#faf8f5" },
    { value: "flame", label: "Flame", icon: "🔥", color: "#ff6600" },
    { value: "ocean", label: "Ocean", icon: "🌊", color: "#0088cc" },
];

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>("dark");
    const [mounted, setMounted] = useState(false);

    // Load theme from localStorage on mount
    useEffect(() => {
        setMounted(true);
        const stored = localStorage.getItem("theme") as Theme;
        if (stored && themes.some(t => t.value === stored)) {
            setThemeState(stored);
        }
    }, []);

    // Apply theme class to document
    useEffect(() => {
        if (!mounted) return;

        const root = window.document.documentElement;

        // Remove all theme classes
        themes.forEach(t => root.classList.remove(t.value));
        // Add current theme class
        root.classList.add(theme);
        localStorage.setItem("theme", theme);
    }, [theme, mounted]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
    };

    // Prevent hydration mismatch
    if (!mounted) {
        return <>{children}</>;
    }

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
