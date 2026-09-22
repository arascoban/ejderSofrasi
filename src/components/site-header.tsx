import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="wordmark" href="/map">
        <span className="wordmark__sigil" aria-hidden="true">ES</span>
        <span>
          <strong>Ejder Sofrası</strong>
          <small>Dünya Atlası</small>
        </span>
      </Link>
      <nav aria-label="Ana gezinme">
        <Link href="/map">Harita</Link>
        <Link href="/wiki">Dünya arşivi</Link>
        <Link href="/search">Ara</Link>
        <Link href="/episodes">Bölümler</Link>
        <Link href="/lore">Lore</Link>
      </nav>
    </header>
  );
}
