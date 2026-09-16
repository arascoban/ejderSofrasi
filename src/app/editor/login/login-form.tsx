"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = { error: null };

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);

  return (
    <form action={action} className="editor-login-form">
      <label>
        <span>E-posta</span>
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <label>
        <span>Parola</span>
        <input name="password" type="password" autoComplete="current-password" minLength={8} required />
      </label>
      {state.error ? <p className="form-error" role="alert">{state.error}</p> : null}
      <button className="button button--primary" type="submit" disabled={pending}>
        {pending ? "Giriş yapılıyor…" : "Giriş yap"}
      </button>
    </form>
  );
}
