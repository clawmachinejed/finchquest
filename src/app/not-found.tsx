// src/app/not-found.tsx
export const dynamic = 'force-static';

export default function NotFound() {
  return (
    <main className="p-6 text-center">
      <h1 className="text-xl font-semibold">Page not found</h1>
      <p className="mt-2 text-sm text-gray-500">The page you’re looking for doesn’t exist.</p>
    </main>
  );
}
