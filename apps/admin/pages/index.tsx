import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ fontFamily: "Arial, sans-serif", padding: 24 }}>
      <h1>Painel Admin - OndeAcho</h1>
      <p>Base inicial pronta para CRUD administrativo.</p>
      <ul>
        <li>
          <Link href="/login">Login administrativo</Link>
        </li>
        <li>
          <Link href="/dashboard">Dashboard</Link>
        </li>
      </ul>
    </main>
  );
}
