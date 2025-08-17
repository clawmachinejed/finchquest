// src/components/nav/LinkWithParams.tsx
'use client';

import NextLink, { type LinkProps as NextLinkOptions } from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { AnchorHTMLAttributes, MouseEvent, PropsWithChildren } from "react";

type CarryKey = "domain";

type LinkProps = PropsWithChildren &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & // allow onClick, etc.
  NextLinkOptions & {
    href: string;
    carry?: CarryKey[];
    query?: Record<string, string | number | boolean | undefined>;
    disabled?: boolean;
    onBeforeNavigate?: (e: MouseEvent<HTMLAnchorElement>) => boolean | void;
  };

export default function LinkWithParams({
  children,
  href,
  carry,
  query,
  disabled,
  onBeforeNavigate,
  ...rest
}: LinkProps) {
  const params = useSearchParams();

  const p = new URLSearchParams(params?.toString() ?? "");
  if (carry?.includes("domain") && !("domain" in (query ?? {}))) {
    const d = params?.get("domain");
    if (d) p.set("domain", d);
  }
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined) p.delete(k);
      else p.set(k, String(v));
    }
  }

  const fullHref = `${href}${p.toString() ? `?${p.toString()}` : ""}`;

  if (disabled) {
    return (
      <a
        aria-disabled="true"
        onClick={(e) => e.preventDefault()}
        {...rest}
        href={fullHref}
      >
        {children}
      </a>
    );
  }

  return (
    <NextLink
      {...rest}
      href={fullHref}
      onClick={(e) => {
        if (onBeforeNavigate?.(e) === false) {
          e.preventDefault();
        }
        (rest as any).onClick?.(e);
      }}
    >
      {children}
    </NextLink>
  );
}
