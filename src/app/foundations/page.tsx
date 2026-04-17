import { redirect } from 'next/navigation';

// The 5-module AI Foundations course has been superseded by the 9-module
// AiBI-P course at a lower price point ($79 vs. $97). Redirect permanently.
export default function FoundationsPage() {
  redirect('/courses/aibi-p');
}
