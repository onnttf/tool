"use client"

import { usePathname } from "next/navigation"
import { Home, Braces } from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from "@/components/ui/sidebar"

const items = [
    {
        title: "Home",
        url: "/",
        icon: Home,
    },
    {
        title: "JSON",
        url: "/json",
        icon: Braces,
    },
]

export function AppSidebar() {
    const pathname = usePathname()

    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroupContent>
                    <SidebarMenu>
                        {items.map((item) => {
                            const isActive = pathname === item.url
                            return (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton 
                                        asChild
                                        isActive={isActive}
                                    >
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )
                        })}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarContent>
        </Sidebar>
    )
}
