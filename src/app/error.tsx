"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="ana-icerik" className="centered-state">
      <p className="eyebrow">Veri okunamadı</p>
      <h1>Arşiv şu anda açılamıyor.</h1>
      <p>Doğrulama hatası kayda alındı. Yeniden deneyebilir veya dünya arşivine dönebilirsin.</p>
      <button className="button button--primary" onClick={reset}>Yeniden dene</button>
    </main>
  );
}
