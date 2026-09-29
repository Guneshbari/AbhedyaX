"use client";

/**
 * DemoDashboardCTA — client island added to the existing server-rendered Dashboard.
 * Shows "Analyze VPN →" during demo journey step 1.
 */

import React from "react";
import { DemoNextStepCTA } from "@/components/ui/DemoNextStepCTA";

export function DemoDashboardCTA() {
  return (
    <DemoNextStepCTA
      nextRoute="/analyze"
      nextLabel="Analyze VPN"
      context="Step 2 of 8 — Submit a canonical scenario for end-to-end security analysis."
    />
  );
}
