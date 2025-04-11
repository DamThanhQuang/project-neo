"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import HostHeader from "./HostHeader";

export default function ConditionalHeader() {
  const pathname = usePathname();

  const isHostDashboard = pathname?.startsWith("/host/dashboard");

  return isHostDashboard ? <HostHeader /> : <Header />;
}
