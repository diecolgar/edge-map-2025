"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// Carga dinámica del EventMap sin SSR
const EventMap = dynamic(() => import("./EventMap"), {
  ssr: false,
});

export default function Page() {
  return (
    <Suspense fallback={<div className="text-center p-8">Cargando mapa...</div>}>
      <EventMap />
    </Suspense>
  );
}
