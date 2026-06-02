import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EssayPage } from "@/components/system/templates";
import { ESSAYS, loadEssay } from "@content/essays/_lib/registry";

interface PageParams {
  readonly params: Promise<{ readonly slug: string }>;
}

export async function generateStaticParams() {
  return ESSAYS.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { slug } = await params;
  const mod = await loadEssay(slug);
  if (!mod) return { title: "Essay not found" };
  return {
    title: mod.meta.title,
    description: mod.meta.dek ?? mod.meta.title,
  };
}

export default async function EssayRoute({ params }: PageParams) {
  const { slug } = await params;
  const mod = await loadEssay(slug);
  if (!mod) notFound();

  const Body = mod.default;
  return (
    <EssayPage
      title={mod.meta.title}
      dek={mod.meta.dek}
      date={mod.meta.date}
      category={mod.meta.category}
      readMinutes={mod.meta.readMinutes}
      author={mod.meta.author}
      sources={mod.meta.sources}
    >
      <Body />
    </EssayPage>
  );
}
