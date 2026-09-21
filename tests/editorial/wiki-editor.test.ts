// @vitest-environment happy-dom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { Editor } from "@tiptap/core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { EditorArticleState } from "@/lib/editorial/editor-state";
import { validateArticleDocument } from "@/lib/editorial/document";

const harness = vi.hoisted(() => ({ editor: null as Editor | null, save: vi.fn(), publish: vi.fn(), rollback: vi.fn(), remove: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: harness.refresh }) }));
vi.mock("@/app/editor/[entityId]/actions", () => ({
  saveDraftAction: harness.save, publishDraftAction: harness.publish,
  rollbackArticleAction: harness.rollback,
  removeDraftMediaAction: harness.remove, reorderDraftMediaAction: vi.fn(), processMediaAction: vi.fn(),
}));
vi.mock("@/lib/supabase/client", () => ({ createSupabaseBrowserClient: vi.fn() }));
vi.mock("@tiptap/react", async (original) => {
  const real = await original<typeof import("@tiptap/react")>();
  return { ...real, useEditor: (...args: Parameters<typeof real.useEditor>) => {
    const editor = real.useEditor(...args);
    harness.editor = editor;
    return editor;
  } };
});
import { WikiEditor } from "@/app/editor/[entityId]/wiki-editor";

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}
const initial: EditorArticleState = {
  articleId: "article", entityId: "NPC-0006", draftId: "draft-1", lockVersion: 1,
  baseCoreReleaseId: "core", basedOnRevisionId: null, publishedRevisionId: null,
  document: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "İlk metin" }] }] },
  period: null, changeNote: "", revisions: [], draftMedia: [],
};
const publishedState: EditorArticleState = {
  ...initial, draftId: null, lockVersion: null, basedOnRevisionId: "revision-2", publishedRevisionId: "revision-2",
  revisions: [2, 1].map((n) => ({ revisionId: `revision-${n}`, revisionNumber: n, changeNote: "Test", publishedAt: "2026-09-17T10:00:00Z", createdBy: "owner", sourceRevisionId: null })),
};
let host: HTMLDivElement;
let root: Root;
async function mount(state = initial) {
  await act(async () => { root.render(createElement(WikiEditor, { state, entityOptions: [], userId: "owner" })); });
}
function button(text: string) {
  const found = [...host.querySelectorAll("button")].find((node) => node.textContent === text);
  if (!found) throw new Error(`Missing button: ${text}`);
  return found;
}
async function edit(text: string) {
  await act(async () => { harness.editor!.commands.setContent(`<p>${text}</p>`); });
}
async function autosave() {
  await act(async () => { await vi.advanceTimersByTimeAsync(1700); });
}
beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
  harness.save.mockImplementation(async (input) => ({ ok: true, message: "Kaydedildi", draftId: input.expectedDraftId ?? "draft-2", lockVersion: (input.expectedLockVersion ?? 0) + 1 }));
});
afterEach(async () => {
  await act(async () => { root.unmount(); });
  host.remove(); vi.restoreAllMocks(); vi.useRealTimers();
});

describe("gerçek Tiptap editörü kayıt akışı", () => {
  it("yeni makale içi görsel eklendiğinde kaydedilen belge sabit kimliğini korur", async () => {
    const mediaId = "28c5dc72-2072-4ef1-85bb-b9dd22d3adea";
    await mount();
    await act(async () => {
      harness.editor!.chain().focus().insertContent({ type: "image", attrs: { mediaId } }).run();
    });
    await mount({ ...initial, draftMedia: [{ mediaId, role: "inline", position: 0, period: null, alternativeTextTr: "Test", captionTr: "Test", previewUrl: "/fixture.webp" }] });
    await autosave();
    const document = harness.save.mock.lastCall?.[0].document;
    // React Server Actions cannot serialize ProseMirror's null-prototype attrs
    // as ordinary JSON; they become opaque temporary client references.
    expect(Object.getPrototypeOf(document.content[0].attrs)).toBe(Object.prototype);
    expect(validateArticleDocument(document).issues).toEqual([]);
    expect(document.content[0].attrs.mediaId).toBe(mediaId);
  });
  it("eski kayıt yanıtı yeni metni kaydedildi saymaz; yeni metni gönderir", async () => {
    const first = deferred<{ ok: boolean; message: string; draftId: string; lockVersion: number }>();
    const second = deferred<{ ok: boolean; message: string; draftId: string; lockVersion: number }>();
    harness.save.mockImplementationOnce(() => first.promise).mockImplementationOnce(() => second.promise);
    await mount(); await edit("A"); await autosave(); await edit("B");
    await act(async () => { first.resolve({ ok: true, message: "A kaydedildi", draftId: "draft-1", lockVersion: 2 }); });
    expect(host.querySelector(".save-status")?.textContent).not.toContain("Taslak kaydedildi");
    expect(harness.save.mock.lastCall?.[0].document.content[0].content[0].text).toBe("B");
    await act(async () => { second.resolve({ ok: true, message: "B kaydedildi", draftId: "draft-1", lockVersion: 3 }); });
    expect(host.querySelector(".save-status")?.textContent).toContain("Taslak kaydedildi");
  });

  it("medya kaldırma sonrası kayıt güncel lock ile gider", async () => {
    harness.remove.mockResolvedValue({ ok: true, message: "Kaldırıldı", draftId: "draft-1", lockVersion: 7 });
    await mount({ ...initial, draftMedia: [{ mediaId: "image-1", role: "gallery", position: 0, period: null, alternativeTextTr: "Deneme", captionTr: "", previewUrl: "/fixture.webp" }] });
    await act(async () => { button("Kaldır").click(); });
    await edit("Medya sonrası yazı"); await autosave();
    expect(harness.save.mock.lastCall?.[0].expectedLockVersion).toBe(7);
    expect(host.querySelector(".draft-media-manager img")).toBeNull();
  });

  it("yayın sırasında tüm düzenleme kilitlenir, sonra yeni taslak doğru yayından açılır", async () => {
    const published = deferred<{ ok: boolean; message: string; revisionId: string }>();
    harness.publish.mockImplementation(() => published.promise);
    await mount();
    await act(async () => { button("Yayımla").click(); });
    expect(host.querySelector("fieldset")?.disabled).toBe(true);
    expect(harness.editor!.isEditable).toBe(false);
    await act(async () => { published.resolve({ ok: true, message: "Yayımlandı", revisionId: "revision-2" }); });
    expect(harness.editor!.isEditable).toBe(true);
    await edit("Yeni yazı"); await autosave();
    expect(harness.save.mock.lastCall?.[0]).toMatchObject({ expectedDraftId: null, expectedLockVersion: null, expectedPublishedRevisionId: "revision-2" });
  });

  it("yayın kilidini açmak kendiliğinden taslak oluşturmaz ve geri almayı engellemez", async () => {
    harness.publish.mockResolvedValue({ ok: true, message: "Yayımlandı", revisionId: "revision-3" });
    await mount({ ...publishedState, draftId: "draft-1", lockVersion: 1 });
    await act(async () => { button("Yayımla").click(); });
    const savesAtPublication = harness.save.mock.calls.length;
    // Model the fresh server props delivered by router.refresh without remounting
    // the client editor, then wait beyond multiple autosave intervals.
    await mount({ ...publishedState, basedOnRevisionId: "revision-3", publishedRevisionId: "revision-3" });
    await act(async () => { await vi.advanceTimersByTimeAsync(5000); });
    expect(harness.save).toHaveBeenCalledTimes(savesAtPublication);
    expect(harness.editor!.isEditable).toBe(true);
    expect(button("Bu sürümü geri getir").disabled).toBe(false);
    expect(host.textContent).not.toContain("Önce mevcut taslağı yayımlayın");
  });

  it("başarısız geri alma kilidini açmak temiz yayından taslak üretmez", async () => {
    harness.rollback.mockResolvedValue({ ok: false, message: "İşlem reddedildi." });
    await mount(publishedState);
    await act(async () => { button("Bu sürümü geri getir").click(); });
    await autosave();
    expect(harness.save).not.toHaveBeenCalled();
    expect(harness.editor!.isEditable).toBe(true);
    expect(host.querySelector(".save-status")?.textContent).toContain("İşlem reddedildi.");
  });

  it("medya çakışması metin değiştirildiğinde de otomatik kaydı durdurur", async () => {
    harness.remove.mockResolvedValue({ ok: false, conflict: true, message: "Başka oturum değiştirdi." });
    await mount({ ...initial, draftMedia: [{ mediaId: "image-1", role: "gallery", position: 0, period: null, alternativeTextTr: "Deneme", captionTr: "", previewUrl: "/fixture.webp" }] });
    await act(async () => { button("Kaldır").click(); });
    await edit("Korunacak yazı"); await autosave();
    expect(harness.save).not.toHaveBeenCalled();
    expect(host.textContent).toContain("Sürüm çakışması");
    expect(harness.editor!.getText()).toBe("Korunacak yazı");
    expect(button("Yerel taslağı indir").disabled).toBe(false);
  });

  it("yayın RPC çakışması yerel yazıyı korur ve tekrar yazınca yeniden yayınlamaz", async () => {
    harness.publish.mockResolvedValue({ ok: false, conflict: true, message: "Başka oturum değiştirdi." });
    await mount();
    await act(async () => { button("Yayımla").click(); });
    expect(harness.publish).toHaveBeenCalledOnce();
    await edit("Yayın çatışmasından sonra korunacak yazı"); await autosave();
    expect(harness.save).not.toHaveBeenCalled();
    expect(host.textContent).toContain("Sürüm çakışması");
    expect(harness.editor!.getText()).toBe("Yayın çatışmasından sonra korunacak yazı");
    expect(button("Yayımla").disabled).toBe(true);
    expect(button("Yerel taslağı indir").disabled).toBe(false);
  });

  it("kayıt ağ hatası yerel metni silmez; kullanıcı tekrar kaydettiğinde son yazıyı gönderir", async () => {
    harness.save.mockRejectedValueOnce(new Error("Bağlantı kesildi"));
    await mount(); await edit("Kaybolmaması gereken yazı"); await autosave();
    expect(harness.editor!.getText()).toBe("Kaybolmaması gereken yazı");
    expect(host.textContent).toContain("Bağlantı kesildi");
    await edit("Son yerel yazı"); await autosave();
    expect(harness.save.mock.lastCall?.[0].document.content[0].content[0].text).toBe("Son yerel yazı");
    expect(host.querySelector(".save-status")?.textContent).toContain("Taslak kaydedildi");
  });

  it("kaydedilmemiş metin ve kayıtlı taslak varken geri alma yazıyı ezmez", async () => {
    await mount(publishedState);
    await edit("Korunacak taslak");
    expect(button("Bu sürümü geri getir").disabled).toBe(true);
    await autosave();
    expect(button("Bu sürümü geri getir").disabled).toBe(true);
    await act(async () => { button("Bu sürümü geri getir").click(); });
    expect(harness.rollback).not.toHaveBeenCalled();
    expect(harness.editor!.getText()).toBe("Korunacak taslak");
  });

  it("geri alma tamamlanana kadar düzenlemeyi kilitler ve temiz sunucu durumunu yükler", async () => {
    const result = deferred<{ ok: boolean; message: string; revisionId: string }>();
    harness.rollback.mockImplementation(() => result.promise);
    const reload = vi.spyOn(window.location, "reload").mockImplementation(() => {});
    await mount(publishedState);
    await act(async () => { button("Bu sürümü geri getir").click(); });
    expect(harness.editor!.isEditable).toBe(false);
    expect(host.querySelector("fieldset")?.disabled).toBe(true);
    expect(harness.save).not.toHaveBeenCalled();
    expect(harness.rollback).toHaveBeenCalledWith("NPC-0006", "revision-1", "revision-2", "Sürüm 1 geri getirildi.");
    await act(async () => { result.resolve({ ok: true, message: "Geri getirildi", revisionId: "revision-3" }); });
    expect(reload).toHaveBeenCalledOnce();
  });

  it("yayınlanmış temiz makalede Tiptap JSON normalizasyonu rollback düğmesini kilitlemez", async () => {
    const result = deferred<{ ok: boolean; message: string; revisionId: string }>();
    harness.rollback.mockImplementation(() => result.promise);
    const reload = vi.spyOn(window.location, "reload").mockImplementation(() => {});
    await mount(publishedState);
    const rollbackButton = button("Bu sürümü geri getir");
    expect(rollbackButton.disabled).toBe(false);
    await act(async () => { rollbackButton.click(); });
    expect(harness.rollback).toHaveBeenCalledOnce();
    await act(async () => { result.resolve({ ok: true, message: "Geri getirildi", revisionId: "revision-3" }); });
    expect(reload).toHaveBeenCalledOnce();
  });

  it("sunucudan eski yayına dayanan taslak gelirse başlangıçta çakışmayı korur", async () => {
    await mount({ ...initial, publishedRevisionId: "new-revision" });
    await edit("Yerel metin"); await autosave();
    expect(harness.save).not.toHaveBeenCalled();
    expect(host.textContent).toContain("Sürüm çakışması");
    expect(harness.editor!.getText()).toBe("Yerel metin");
  });

  it("makale içi görseli gösterir; geçici URL belgeye veya sonraki kayda girmez", async () => {
    const mediaId = "00000000-0000-4000-8000-000000000001";
    await mount({ ...initial,
      document: { type: "doc", content: [{ type: "image", attrs: { mediaId } }, { type: "paragraph" }] },
      draftMedia: [{ mediaId, role: "inline", position: 0, period: null, alternativeTextTr: "Mor test karesi", captionTr: "Test", previewUrl: "/temporary-preview.webp" }],
    });
    expect(host.querySelector('.wiki-editor-content img')?.getAttribute("src")).toBe("/temporary-preview.webp");
    expect(host.querySelector('.wiki-editor-content img')?.getAttribute("alt")).toBe("Mor test karesi");
    await act(async () => { harness.editor!.commands.insertContentAt(harness.editor!.state.doc.content.size - 1, "Sonraki yazı"); });
    await autosave();
    const sent = JSON.stringify(harness.save.mock.lastCall?.[0].document);
    expect(sent).toContain(mediaId);
    expect(sent).not.toContain("temporary-preview");
  });
});
