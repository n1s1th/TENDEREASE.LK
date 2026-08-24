"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface BackLinkProps {
  href: string;
  label: string;
}

/**
 * Single back-navigation row for sub-pages.
 *
 * Deliberately a plain inline link rather than a bordered full-width bar, so it
 * reads as breadcrumb navigation under the site navbar instead of a second one.
 */
export default function BackLink({ href, label }: BackLinkProps) {
  return (
    <nav aria-label="Breadcrumb">
      <Link
        href={href}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-primary"
      >
        <ArrowLeft size={16} />
        {label}
      </Link>
    </nav>
  );
}
