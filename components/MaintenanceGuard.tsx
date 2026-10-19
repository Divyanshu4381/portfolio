"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import MaintenanceView from "@/components/MaintenanceView";
import Link from "next/link";
import { AlertTriangle, Settings } from "lucide-react";

interface MaintenanceStatus {
  enabled: boolean;
  isAdmin: boolean;
  title?: string;
  message?: string;
}

export default function MaintenanceGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [status, setStatus] = useState<MaintenanceStatus | null>(null);
  const [loading, setLoading] = useState(true);

  // Always allow admin routes and api routes without guard
  const isAdminRoute = pathname?.startsWith("/admin");
  const isApiRoute = pathname?.startsWith("/api");

  useEffect(() => {
    // If it's an admin route, we don't need to block
    if (isAdminRoute || isApiRoute) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function checkMaintenance() {
      try {
        const res = await fetch("/api/maintenance/status", {
          cache: "no-store",
        });
        if (res.ok) {
          const data: MaintenanceStatus = await res.json();
          if (isMounted) {
            setStatus(data);
          }
        }
      } catch (err) {
        console.warn("Could not check maintenance status:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    checkMaintenance();

    return () => {
      isMounted = false;
    };
  }, [pathname, isAdminRoute, isApiRoute]);

  // If on admin or api route, render directly
  if (isAdminRoute || isApiRoute) {
    return <>{children}</>;
  }

  // If maintenance mode is enabled
  if (status?.enabled) {
    // If admin is logged in, show portfolio with top warning banner
    if (status.isAdmin) {
      return (
        <>
          <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-300 px-4 py-2.5 text-xs sm:text-sm font-medium flex items-center justify-between sticky top-0 z-50 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Maintenance Mode is Active.</strong> Visitors currently see the maintenance screen.
              </span>
            </div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500 text-black font-semibold rounded-md text-xs hover:bg-amber-400 transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Open Admin Panel</span>
            </Link>
          </div>
          {children}
        </>
      );
    }

    // Public visitor sees maintenance screen
    return <MaintenanceView title={status.title} message={status.message} />;
  }

  return <>{children}</>;
}
