import { redirect } from 'next/navigation'

// The account page lives inside the dashboard now. This keeps old links and bookmarks working.
export default function Account() {
  redirect('/dashboard/account')
}
