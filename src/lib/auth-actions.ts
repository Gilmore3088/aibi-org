import { sendVerificationRequest } from 'next-auth/providers/email';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * Custom action to send a magic link specifically for post-purchase flows.
 * 
 * This overrides the default "confirm email change" behavior by ensuring
 * the `callbackUrl` points to the purchased content, not the generic auth page.
 */
export async function sendMagicLink({
  email,
  callbackUrl,
  type = 'signin'
}: {
  email: string;
  callbackUrl: string;
  type?: 'signin' | 'post_purchase_magic_link';
}) {
  // In a real implementation, this would call your database or email service (e.g., Resend, SendGrid)
  // to generate a token and send the email.
  
  // Simulating the logic to ensure the link is correct
  if (!email) {
    throw new Error('Email is required');
  }

  // Construct the link with the specific callback to avoid the "Change Email" page
  // The backend handler for this token must respect the callbackUrl
  const link = `${process.env.NEXTAUTH_URL}/api/auth/callback/email?token=GENERATED_TOKEN&email=${encodeURIComponent(email)}&callbackUrl=${encodeURIComponent(callbackUrl)}`;

  // TODO: Replace with actual email sending logic (e.g., Resend)
  // await resend.emails.send({
  //   from: 'AIBI Org <noreply@aibi.org>',
  //   to: email,
  //   subject: 'Your AIBI Assessment is Ready',
  //   html: `<a href="${link}">Click here to access your assessment</a>`
  // });

  console.log(`Magic link generated for ${email} -> ${callbackUrl}`);
  
  // Simulate network delay for UI feedback
  await new Promise(resolve => setTimeout(resolve, 1000));

  return { success: true, link };
}