import { Home, Code, Clock } from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface NavItem {
    title: string;
    url: string;
    icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
    {
        title: "Home",
        url: "/",
        icon: Home,
    },
    {
        title: "JSON Formatter",
        url: "/json",
        icon: Code,
    },
    {
        title: "Time Converter",
        url: "/time",
        icon: Clock,
    }
];