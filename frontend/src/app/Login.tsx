import { useState } from "react";
import { fetchLogin } from "../api/client";

export default function Login({ onLogin }: { onLogin: (token: string) => void }) {
  const [username, setUsername] = useState("demo");
  const [password, setPassword] = useState("demo");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const token = await fetchLogin(username, password);
    localStorage.setItem("token", token);
    onLogin(token);
  }

  return (
    <div style={{ maxWidth: 360, margin: "80px auto", padding: 16 }}>
      <h2>Mock Login</h2>

      <form onSubmit={submit}>
        <div style={{ marginBottom: 10 }}>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
            style={{ width: "100%", padding: 10 }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <input
            value={password}
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            style={{ width: "100%", padding: 10 }}
          />
        </div>

        <button style={{ width: "100%", padding: 10 }} type="submit">
          Login (Click here directly)
        </button>
      </form>
      {error && <div style={{ marginTop: 10, color: "crimson" }}>{error}</div>}
    </div>
  );
}


