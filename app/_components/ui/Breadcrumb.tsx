import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-1 text-sm", className)}>
      <ol className="flex items-center gap-1">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1">
              {i > 0 ? (
                <ChevronRight
                  size={14}
                  className="text-[var(--color-fg-subtle)]"
                  aria-hidden
                />
              ) : null}
              {isLast || !item.href ? (
                <span
                  className={cn(
                    "font-medium",
                    isLast
                      ? "text-[var(--color-fg)]"
                      : "text-[var(--color-fg-muted)]",
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] transition-colors duration-100"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
