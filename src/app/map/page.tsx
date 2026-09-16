import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { InteractiveMap } from "@/components/map/interactive-map";
import { getMapInventoryRelease } from "@/lib/presentation/map-repository";

export const metadata: Metadata = { title: "Harita" };

export default async function MapPage() {
  const release = await getMapInventoryRelease();

  return (
    <main id="ana-icerik" className="atlas-page">
      <Suspense fallback={<section className="centered-state"><p>Harita hazırlanıyor…</p></section>}>
        <InteractiveMap release={release} />
      </Suspense>
      <noscript>
        <section className="empty-state">
          <h2>Harita için JavaScript gerekiyor.</h2>
          <p>Kayıtların tümüne dünya arşivinden erişebilirsin.</p>
          <Link className="button button--primary" href="/wiki">Dünya arşivini aç</Link>
        </section>
      </noscript>
    </main>
  );
}
