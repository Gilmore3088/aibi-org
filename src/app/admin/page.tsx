// /admin redirects to the default analytics view.
import { redirect } from 'next/navigation';

export default function AdminIndex() {
  redirect('/admin/analytics');
}
