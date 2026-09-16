"use client";

import { useActionState } from "react";
import { inviteEditorAction, type InviteState } from "./actions";

const initialState: InviteState = { error: null, success: null };

export function InviteForm() {
  const [state, action, pending] = useActionState(inviteEditorAction, initialState);
  return (
    <form action={action} className="editor-login-form owner-invite-form">
      <label><span>Görünen ad</span><input name="displayName" maxLength={100} required /></label>
      <label><span>E-posta</span><input name="email" type="email" autoComplete="off" required /></label>
      {state.error ? <p className="form-error" role="alert">{state.error}</p> : null}
      {state.success ? <p className="form-success" role="status">{state.success}</p> : null}
      <button className="button button--primary" type="submit" disabled={pending}>{pending ? "Davet gönderiliyor…" : "Editör davet et"}</button>
    </form>
  );
}
