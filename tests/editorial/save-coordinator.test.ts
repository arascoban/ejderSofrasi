import { describe, expect, it, vi } from "vitest";
import { SaveCoordinator, type SaveCoordinatorSnapshot } from "@/lib/editorial/save-coordinator";

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((next) => { resolve = next; });
  return { promise, resolve };
}

describe("editoryal kayıt koordinatörü", () => {
  function fixture() {
    let snapshot = { sequence: 0, value: "A", payload: "A" };
    let version = 1;
    const send = vi.fn(async (_snapshot: SaveCoordinatorSnapshot<string, string>, token: number | null) => {
      version = Math.max(version, token ?? 0) + 1;
      return { ok: true, token: version };
    });
    const coordinator = new SaveCoordinator<string, string, number>({
      initialToken: 1, initialSavedValue: "A", equals: (a, b) => a === b,
      getSnapshot: () => snapshot, send,
    });
    return { coordinator, send, edit(value: string) { snapshot = { sequence: snapshot.sequence + 1, value, payload: value }; } };
  }

  it("A→B uçuşta→A geri alma: yayın son A kaydını bekler", async () => {
    const f = fixture();
    const b = deferred<{ ok: boolean; token: number }>();
    f.send.mockImplementationOnce(() => b.promise);
    f.edit("B");
    const saving = f.coordinator.enqueue();
    f.edit("A");
    const publish = vi.fn(async () => ({ ok: true, token: null }));
    const publishing = f.coordinator.mutate(publish);
    expect(publish).not.toHaveBeenCalled();
    b.resolve({ ok: true, token: 2 });
    await saving;
    await publishing;
    expect(f.send.mock.calls.map((call) => call[0])).toHaveLength(2);
    expect(publish).toHaveBeenCalledOnce();
    expect(f.coordinator.token).toBeNull();
  });

  it("uçuş sırasında değişen dönem ve not tam snapshot olarak gönderilir", async () => {
    const f = fixture();
    const first = deferred<{ ok: boolean; token: number }>();
    f.send.mockImplementationOnce(() => first.promise);
    f.edit(JSON.stringify({ document: "A", period: "1300 civarı", note: "ilk" }));
    const saving = f.coordinator.enqueue();
    f.edit(JSON.stringify({ document: "A", period: "1600 civarı", note: "son" }));
    first.resolve({ ok: true, token: 2 });
    await saving;
    expect(f.send).toHaveBeenLastCalledWith(expect.objectContaining({ payload: JSON.stringify({ document: "A", period: "1600 civarı", note: "son" }) }), 2);
  });

  it("ağ hatasından sonra son metni yeniden kaydeder", async () => {
    const f = fixture();
    f.send.mockRejectedValueOnce(new Error("offline"));
    f.edit("B");
    await expect(f.coordinator.enqueue()).resolves.toMatchObject({ ok: false, message: "offline" });
    f.edit("C");
    await expect(f.coordinator.enqueue()).resolves.toMatchObject({ ok: true });
    expect(f.send).toHaveBeenLastCalledWith(expect.objectContaining({ payload: "C" }), 1);
  });

  it("medya sonrasında otomatik kayıt yeni sürümü kullanır", async () => {
    const f = fixture();
    await f.coordinator.mutate(async () => ({ ok: true, token: 20 }));
    f.edit("B");
    await f.coordinator.enqueue();
    expect(f.send).toHaveBeenCalledWith(expect.objectContaining({ payload: "B" }), 20);
  });

  it("medya eski kayıt yanıtını bekler ve aynı anda yayın/kayıt başlatmaz", async () => {
    const f = fixture();
    const saved = deferred<{ ok: boolean; token: number }>();
    const attached = deferred<{ ok: boolean; token: number }>();
    f.send.mockImplementationOnce(() => saved.promise);
    f.edit("B");
    const saving = f.coordinator.enqueue();
    const attach = vi.fn(async () => attached.promise);
    const media = f.coordinator.mutate(attach);
    const publish = vi.fn();
    expect(f.coordinator.busy).toBe(true);
    await expect(f.coordinator.mutate(publish)).resolves.toMatchObject({ ok: false });
    await expect(f.coordinator.enqueue()).resolves.toMatchObject({ ok: false });
    expect(attach).not.toHaveBeenCalled();
    saved.resolve({ ok: true, token: 2 });
    await saving;
    attached.resolve({ ok: true, token: 3 });
    await media;
    expect(attach).toHaveBeenCalledWith(2);
    expect(publish).not.toHaveBeenCalled();
    expect(f.coordinator.token).toBe(3);
    expect(f.coordinator.busy).toBe(false);
  });

  it.each(["medya", "yayın"])("%s çakışması sonrasında yazı değişse bile otomatik kayıt durur", async () => {
    const f = fixture();
    await f.coordinator.mutate(async () => ({ ok: false, conflict: true, message: "40001" }));
    f.edit("korunacak metin");
    await expect(f.coordinator.enqueue()).resolves.toMatchObject({ ok: false, conflict: true });
    const later = vi.fn();
    await f.coordinator.mutate(later);
    expect(f.send).not.toHaveBeenCalled();
    expect(later).not.toHaveBeenCalled();
  });

  it("yayın taslağı sonlandırır; sonraki düzenleme yeni taslak olarak kaydedilir", async () => {
    const f = fixture();
    await f.coordinator.mutate(async () => ({ ok: true, token: null }));
    f.edit("yayın sonrası yazı");
    await f.coordinator.enqueue();
    expect(f.send).toHaveBeenCalledWith(expect.objectContaining({ payload: "yayın sonrası yazı" }), null);
  });

  it("medya ağ yanıtı kaybolursa kilit çözülür ama belirsiz token ile yazılmaz", async () => {
    const f = fixture();
    await expect(f.coordinator.mutate(async () => { throw new Error("response lost"); })).resolves.toMatchObject({ ok: false, conflict: true });
    expect(f.coordinator.busy).toBe(false);
    expect(f.coordinator.blocked).toBe(true);
  });
  it("uçuşta eski kayıt varken en güncel snapshot ve dönen token ile devam eder", async () => {
    let current = "A";
    let sequence = 0;
    const requests: Array<{ value: string; token: number | null }> = [];
    const first = deferred<{ ok: boolean; token: number }>();
    const second = deferred<{ ok: boolean; token: number }>();
    const pending = [first, second];
    const coordinator = new SaveCoordinator<string, string, number>({
      initialSavedValue: "",
      initialToken: null,
      equals: (left, right) => left === right,
      getSnapshot: (): SaveCoordinatorSnapshot<string, string> => ({ sequence, value: current, payload: current }),
      send: async (snapshot, token) => {
        requests.push({ value: snapshot.value, token });
        return pending.shift()!.promise;
      },
    });

    current = "A"; sequence = 1;
    const saving = coordinator.enqueue();
    current = "B"; sequence = 2;
    first.resolve({ ok: true, token: 1 });
    await Promise.resolve();
    second.resolve({ ok: true, token: 2 });
    const result = await saving;

    expect(requests).toEqual([{ value: "A", token: null }, { value: "B", token: 1 }]);
    expect(result).toMatchObject({ ok: true, token: 2, sequence: 2 });
  });

  it("çakışmada kuyruğu kilitler ve yeniden denemeyi engeller", async () => {
    let snapshot = { sequence: 1, value: "A" };
    const coordinator = new SaveCoordinator<string, string, number>({
      initialSavedValue: "",
      initialToken: null,
      equals: (left, right) => left === right,
      getSnapshot: () => ({ ...snapshot, payload: snapshot.value }),
      send: async () => ({ ok: false, conflict: true, message: "conflict" }),
    });

    await expect(coordinator.enqueue()).resolves.toMatchObject({ ok: false, conflict: true });
    snapshot = { sequence: 2, value: "B" };
    await expect(coordinator.enqueue()).resolves.toMatchObject({ ok: false, conflict: true, message: "conflict" });
    expect(coordinator.blocked).toBe(true);
  });
});
