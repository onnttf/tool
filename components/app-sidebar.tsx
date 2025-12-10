"use client"

import { usePathname } from "next/navigation"
import { NAV_ITEMS } from "@/config/nav-config"

import {
    Sidebar,
    SidebarContent,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from "@/components/ui/sidebar"

export function AppSidebar() {
    const pathname = usePathname()

    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroupContent>
                    <SidebarMenu>
                        {NAV_ITEMS.map((item) => { // <-- 使用导入的配置
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