import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AiBI-L Leadership Workshop — request a conversation',
  description:
    'AiBI-L is a facilitated leadership workshop for bank and credit union executives. Request a conversation with the Institute to scope a cohort for your team.',
};

export default function AibiLRequestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
