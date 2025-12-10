"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useNavigationContext } from "@/context/nav-context"; // <-- 导入 Hook

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// 将路径段格式化逻辑封装成函数
function formatPathSegment(seg: string): string {
  // 替换连字符为空间，并首字母大写
  return seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function AppBreadcrumb() {
  const pathname = usePathname() || "/";
  const { pathMap } = useNavigationContext();

  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Home</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  // 计算每个路径段对应的完整 URL
  const paths = segments.map((_, i) => "/" + segments.slice(0, i + 1).join("/"));

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segments.map((seg, i) => {
          const isLast = i === segments.length - 1;
          const currentPath = paths[i];

          // 优先从侧边栏配置的 pathMap 中查找标题
          const contextualTitle = pathMap.get(currentPath);

          // 如果没有匹配，则回退到格式化路径段
          const label = contextualTitle || formatPathSegment(seg);

          return (
            <React.Fragment key={i}>
              {!isLast && (
                <>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href={paths[i]}>{label}</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                </>
              )}

              {isLast && (
                <BreadcrumbItem>
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                </BreadcrumbItem>
              )}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}