"use client";

import { useActionState } from "react";
import { setPasswordAction, type PasswordState } from "./actions";

const initialState: PasswordState = { error: null };

export function PasswordForm() {
  const [state, action, pending] = useActionState(setPasswordAction, initialState);
  return (
    <form action={action} className="editor-login-form">
      <label><span>Yeni parola</span><input name="password" type="password" minLength={12} autoComplete="new-password" required /></label>
      <label><span>Yeni parola tekrarı</span><input name="confirmation" type="password" minLength={12} autoComplete="new-password" required /></label>
      {state.error ? <p className="form-error" role="alert">{state.error}</p> : null}
      <button className="button button--primary" type="submit" disabled={pending}>{pending ? "Kaydediliyor…" : "Parolayı kaydet"}</button>
    </form>
  );
}
