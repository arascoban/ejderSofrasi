import Link from "next/link";

export default function NotFound() {
  return (
    <main id="ana-icerik" className="centered-state">
      <p className="eyebrow">Kayıt bulunamadı</p>
      <h1>Bu sayfa arşivde yok.</h1>
      <p>Kimlik değişmiş, bağlantı yanlış yazılmış veya kayıt henüz eklenmemiş olabilir.</p>
      <Link className="button button--primary" href="/wiki">Dünya arşivine dön</Link>
    </main>
  );
}
