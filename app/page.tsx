export const dynamic = 'force-dynamic';

async function getTodos() {
  try {
    const res = await fetch('/api/todos', { cache: 'no-store' });
    if (!res.ok) throw new Error('Chyba při načítání Todos');
    return res.json();
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const todos = await getTodos();

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Welcome to CSTM Project Template</h1>
      <p>✅ Stránka běží, DB placeholder:</p>
      <ul>
        {todos.length ? todos.map((t: any) => (
          <li key={t.id}>{t.title} {t.done ? '✔️' : '❌'}</li>
        )) : <li>No todos yet</li>}
      </ul>
    </main>
  );
}
