import { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import { setAdminToken } from "../src/lib/auth";
import { apiRequest } from "../src/services/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Autenticando...");
    try {
      const response = await apiRequest<{ accessToken: string; user: { role: string } }>(
        "/auth/login",
        {
          method: "POST",
          skipAuth: true,
          body: JSON.stringify({
            email: email.trim(),
            password: password.trim()
          })
        }
      );
      if (response.user.role !== "admin") {
        setMessage("Usuário sem permissão administrativa.");
        return;
      }
      setAdminToken(response.accessToken);
      await router.push("/dashboard");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Falha de autenticação.");
    }
  }

  return (
    <main style={{ fontFamily: "Arial, sans-serif", padding: 24, maxWidth: 420 }}>
      <h1>Login administrativo</h1>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Senha"
        />
        <button type="submit">Entrar</button>
      </form>
      {message && <p>{message}</p>}
    </main>
  );
}
