import { beforeEach, describe, expect, it, vi } from "vitest";
import { createClient } from "@supabase/supabase-js";

const state = vi.hoisted(() => ({ authorized: true, fetch: vi.fn(), revalidate: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: state.revalidate }));
vi.mock("@/lib/editorial/auth", () => ({ getEditorSession: async () => ({ configured: true, user: state.authorized ? { id: "owner" } : null }) }));
vi.mock("@/lib/supabase/server", () => ({ createSupabaseServerClient: async () => createClient("https://fixture.invalid", "fixture-key", {
  auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: state.fetch },
}) }));
import { publishDraftAction, removeDraftMediaAction, reorderDraftMediaAction, saveDraftAction } from "@/app/editor/[entityId]/actions";

beforeEach(() => { vi.clearAllMocks(); state.authorized = true; });

describe("Server Actions gerçek Supabase istemcisiyle HTTP sınırı", () => {
  const draftId = "11111111-1111-4111-8111-111111111111";
  const mediaId = "22222222-2222-4222-8222-222222222222";
  it.each([
    ["publish_wiki_draft", () => publishDraftAction("NPC-0006", 2, draftId, "test")],
    ["remove_media_from_wiki_draft", () => removeDraftMediaAction("NPC-0006", mediaId, draftId, 2)],
    ["reorder_wiki_draft_media", () => reorderDraftMediaAction("NPC-0006", [mediaId], draftId, 2)],
  ] as const)("%s HTTP 409/PT409'u tek istekte kalıcı çakışmaya çevirir", async (rpc, action) => {
    state.fetch.mockResolvedValue(new Response(JSON.stringify({ code: "PT409", message: "Stale draft", details: null, hint: null }), { status: 409, headers: { "content-type": "application/json" } }));
    const result = await action();
    expect(result).toMatchObject({ ok: false, conflict: true });
    expect(state.fetch).toHaveBeenCalledTimes(1);
    expect(String(state.fetch.mock.calls[0][0])).toContain(`/rpc/${rpc}`);
    expect(state.revalidate).not.toHaveBeenCalled();
  });

  it("yetkisiz Server Action doğrudan çağrıldığında hiçbir RPC göndermez", async () => {
    state.authorized = false;
    expect(await publishDraftAction("NPC-0006", 1, draftId, "test")).toMatchObject({ ok: false });
    expect(await removeDraftMediaAction("NPC-0006", mediaId, draftId, 1)).toMatchObject({ ok: false });
    expect(state.fetch).not.toHaveBeenCalled();
  });

  it("gecikmeli HTTP yanıtı gelmeden kayıt tamamlanmış sayılmaz", async () => {
    let resolve!: (response: Response) => void;
    state.fetch.mockImplementation(() => new Promise<Response>(done => { resolve = done; }));
    let finished = false;
    const saving = saveDraftAction({ entityId: "NPC-0006", document: { type: "doc", content: [{ type: "paragraph" }] }, baseCoreReleaseId: "fixture", period: null, changeNote: "", expectedDraftId: draftId, expectedLockVersion: 1, expectedPublishedRevisionId: null }).then(result => { finished = true; return result; });
    await vi.waitFor(() => expect(state.fetch).toHaveBeenCalledOnce());
    expect(finished).toBe(false);
    resolve(new Response(JSON.stringify([{ draft_id: draftId, lock_version: 2, updated_at: "2026-09-21T00:00:00Z" }]), { status: 200, headers: { "content-type": "application/json" } }));
    expect(await saving).toMatchObject({ ok: true, lockVersion: 2, draftId });
  });
});
