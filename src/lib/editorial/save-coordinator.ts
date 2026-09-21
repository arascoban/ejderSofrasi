export interface SaveCoordinatorSnapshot<TValue, TPayload> {
  sequence: number;
  value: TValue;
  payload: TPayload;
}

export interface SaveCoordinatorResponse<TToken> {
  ok: boolean;
  token?: TToken | null;
  message?: string;
  conflict?: boolean;
}

export interface SaveCoordinatorResult<TToken> {
  ok: boolean;
  token: TToken | null;
  sequence: number;
  message?: string;
  conflict?: boolean;
}

interface SaveCoordinatorOptions<TValue, TPayload, TToken> {
  getSnapshot: () => SaveCoordinatorSnapshot<TValue, TPayload> | null;
  send: (
    snapshot: SaveCoordinatorSnapshot<TValue, TPayload>,
    token: TToken | null,
  ) => Promise<SaveCoordinatorResponse<TToken>>;
  initialToken: TToken | null;
  initialSavedValue: TValue;
  equals: (left: TValue, right: TValue) => boolean;
}

/**
 * Coalesces autosaves into one ordered mutation stream. The snapshot is read
 * again after every response, so edits made while a request is in flight can
 * never be acknowledged by the older response.
 */
export class SaveCoordinator<TValue, TPayload, TToken> {
  private readonly options: SaveCoordinatorOptions<TValue, TPayload, TToken>;
  private currentToken: TToken | null;
  private lastSavedValue: TValue;
  private running: Promise<SaveCoordinatorResult<TToken>> | null = null;
  private blockedMessage: string | null = null;
  private mutating = false;

  constructor(options: SaveCoordinatorOptions<TValue, TPayload, TToken>) {
    this.options = options;
    this.currentToken = options.initialToken;
    this.lastSavedValue = options.initialSavedValue;
  }

  get token(): TToken | null {
    return this.currentToken;
  }

  get blocked(): boolean {
    return this.blockedMessage !== null;
  }

  get busy(): boolean {
    return this.mutating;
  }

  get hasPendingDraft(): boolean {
    // This flag answers whether a server-side draft/mutation exists. The
    // editor UI separately tracks local dirty text; comparing Tiptap's
    // normalized JSON here would make a clean published article look like a
    // draft after a reload.
    return this.running !== null || this.currentToken !== null;
  }

  /** Reserve the mutation slot before awaiting any outstanding autosave. */
  async mutate(
    operation: (token: TToken) => Promise<SaveCoordinatorResponse<TToken>>,
  ): Promise<SaveCoordinatorResult<TToken>> {
    if (this.blockedMessage) return this.failure(this.blockedMessage, true);
    if (this.mutating) return this.failure("Başka bir işlem sürüyor.");
    this.mutating = true;
    try {
      if (this.running) {
        const pending = await this.running;
        if (!pending.ok) return pending;
      }
      // Re-read metadata and document after the previous save has settled.
      const saved = await this.drain();
      if (!saved.ok || saved.token === null) return saved;
      const response = await operation(saved.token);
      if (!response.ok || response.token === undefined) {
        return this.failure(response.message ?? "İşlem tamamlanamadı.", response.conflict);
      }
      // Media returns an incremented token; publication explicitly ends the draft.
      this.currentToken = response.token;
      return { ok: true, token: response.token, sequence: saved.sequence, message: response.message };
    } catch (error) {
      // A lost mutation response may mean the server committed it. Do not retry
      // using a token whose validity is now unknown.
      return this.failure(error instanceof Error ? error.message : "İşlem sonucu doğrulanamadı.", true);
    } finally {
      this.mutating = false;
    }
  }

  private failure(message: string, conflict = false): SaveCoordinatorResult<TToken> {
    if (conflict) this.blockedMessage = message;
    return { ok: false, token: null, sequence: this.options.getSnapshot()?.sequence ?? 0, message, conflict };
  }

  enqueue(): Promise<SaveCoordinatorResult<TToken>> {
    if (this.mutating) return Promise.resolve(this.failure("Başka bir işlem sürüyor."));
    if (this.blockedMessage) {
      return Promise.resolve({
        ok: false,
        token: null,
        sequence: this.options.getSnapshot()?.sequence ?? 0,
        message: this.blockedMessage,
        conflict: true,
      });
    }
    if (!this.running) {
      this.running = this.drain().finally(() => {
        this.running = null;
      });
    }
    return this.running;
  }

  private async drain(): Promise<SaveCoordinatorResult<TToken>> {
    while (true) {
      const snapshot = this.options.getSnapshot();
      if (!snapshot) {
        return { ok: false, token: null, sequence: 0, message: "Düzenleyici hazır değil." };
      }

      if (
        this.currentToken !== null &&
        this.options.equals(snapshot.value, this.lastSavedValue)
      ) {
        return { ok: true, token: this.currentToken, sequence: snapshot.sequence };
      }

      let response: SaveCoordinatorResponse<TToken>;
      try {
        response = await this.options.send(snapshot, this.currentToken);
      } catch (error) {
        response = {
          ok: false,
          message: error instanceof Error ? error.message : "Taslak kaydedilemedi.",
        };
      }

      if (!response.ok || response.token == null) {
        if (response.conflict) {
          this.blockedMessage = response.message ?? "Taslak başka bir oturumda değiştirildi.";
        }
        return {
          ok: false,
          token: null,
          sequence: snapshot.sequence,
          message: response.message,
          conflict: response.conflict,
        };
      }

      this.currentToken = response.token;
      this.lastSavedValue = snapshot.value;
      const latest = this.options.getSnapshot();
      if (!latest || latest.sequence === snapshot.sequence) {
        return { ok: true, token: response.token, sequence: snapshot.sequence, message: response.message };
      }
      // A newer edit exists. Loop and send that current snapshot with the
      // token returned by the preceding mutation.
    }
  }
}
