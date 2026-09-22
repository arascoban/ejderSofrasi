import { createElement, type ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ pathname: "/wiki", editorial: vi.fn(), summaries: vi.fn() }));
vi.mock("next/navigation", () => ({
  usePathname: () => state.pathname,
  redirect: (href: string) => { throw new Error(`REDIRECT:${href}`); },
}));
vi.mock("next/link", () => ({ default: (props: ComponentProps<"a">) => createElement("a", { ...props, "data-client-navigation": "true" }) }));
vi.mock("@/lib/data/repository", () => ({ getAllEntitySummaries: state.summaries }));
vi.mock("@/lib/editorial/repository", () => ({ getPublishedEditorialSearchText: state.editorial }));
import WikiDirectory from "@/app/wiki/page";
import LegacySearchPage from "@/app/search/page";

beforeEach(() => {
  vi.clearAllMocks();
  state.pathname = "/wiki";
  state.summaries.mockResolvedValue([]);
  state.editorial.mockResolvedValue(new Map());
});

describe("harita gezinme sınırı ve birleşik arşiv", () => {
  it("eski arama URL'sinin Türkçe sorgusunu ve birleşik filtrelerini korur", async () => {
    const params = { q: "Çöl Şehri", type: "CITY", period: "1300 civarı" };
    await expect(LegacySearchPage({ searchParams: Promise.resolve(params) })).rejects.toThrow(`REDIRECT:/wiki?${new URLSearchParams(params)}`);
    await expect(LegacySearchPage({ searchParams: Promise.resolve({}) })).rejects.toThrow("REDIRECT:/wiki");
  });
  it("sorgusuz dizinde Supabase'i beklemez ve eski dönem URL'sini doğru seçer", async () => {
    const page = await WikiDirectory({ searchParams: Promise.resolve({ period: "1300 civarı" }) });
    const html = renderToStaticMarkup(page);
    expect(state.editorial).not.toHaveBeenCalled();
    expect(html).toContain('value="silver-god-1673" selected=""');
  });
  it("arşiv sorgusunda yayımlanmış metni de arar", async () => {
    await WikiDirectory({ searchParams: Promise.resolve({ q: "kaptan" }) });
    expect(state.editorial).toHaveBeenCalledOnce();
  });
});
