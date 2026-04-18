import { redirect } from 'next/navigation';

// Foundations is retired. The free entry points (assessment + newsletter)
// and the AiBI-P paid track all live on /education now.
// Decision log: 2026-04-17 — Foundations folded into /education hub.
export default function FoundationsPage() {
  redirect('/education');
}
