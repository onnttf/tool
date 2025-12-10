"use client";

import { createContext, useContext, useMemo, ReactNode } from 'react';
import { NAV_ITEMS, NavItem } from '@/config/nav-config';

interface NavigationContextType {
    items: NavItem[];
    pathMap: Map<string, string>;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
    const pathMap = useMemo(() => {
        const map = new Map<string, string>();
        NAV_ITEMS.forEach(item => {
            map.set(item.url, item.title);
        });
        return map;
    }, []);

    const value = {
        items: NAV_ITEMS,
        pathMap,
    };

    return (
        <NavigationContext.Provider value={value}>
            {children}
        </NavigationContext.Provider>
    );
}

export function useNavigationContext() {
    const context = useContext(NavigationContext);
    if (context === undefined) {
        throw new Error('useNavigationContext must be used within a NavigationProvider');
    }
    return context;
}