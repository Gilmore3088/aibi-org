import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle2, Mail } from 'lucide-react';
import { sendMagicLink } from '@/lib/auth-actions';

/**
 * PostPurchaseAuthGate
 * 
 * Fixes Issue #463: Post-purchase friction.
 * 
 * Instead of forcing a "Create Account" vs "I have one" decision tree,
 * this component recognizes the paid context and offers a single, 
 * frictionless "Email me a sign-in link" flow.
 * 
 * It bypasses the "Confirm email address change" confusion by ensuring
 * the magic link redirects to the purchased content dashboard, not an email verification page.
 */
export default function PostPurchaseAuthGate() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in, redirect immediately to the purchased content
  useEffect(() => {
    if (status === 'authenticated') {
      // Redirect to the specific assessment page or dashboard
      router.push('/dashboard/assessment/in-depth');
    }
  }, [status, router]);

  // If not authenticated, show the gate
  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Send the magic link with a specific callback to the purchased content
      // This ensures the user lands on the content, not a "confirm email" page
      await sendMagicLink({
        email,
        callbackUrl: '/dashboard/assessment/in-depth?payment_verified=true',
        type: 'post_purchase_magic_link' 
      });
      
      setIsSent(true);
    } catch (err) {
      console.error('Magic link error:', err);
      setError('Failed to send sign-in link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <Card className="mx-auto max-w-md border-green-200 bg-green-50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-900">Check your inbox!</CardTitle>
          <CardDescription className="text-green-800">
            We've sent a one-click sign-in link to <strong>{email}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4 text-sm text-green-700">
            Click the link to instantly access your $99 In-Depth Assessment. 
            No password required.
          </p>
          <Button 
            variant="outline" 
            onClick={() => setIsSent(false)}
            className="text-green-700 border-green-300 hover:bg-green-100"
          >
            Didn't receive it? Send again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-md shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Welcome to your Assessment</CardTitle>
        <CardDescription>
          Your payment is confirmed. To access your results, please verify your email.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="pl-9"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Link...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Email Me a Sign-In Link
              </>
            )}
          </Button>

          <div className="mt-4 rounded-md bg-blue-50 p-3 text-xs text-blue-800">
            <strong>Why this method?</strong> Since you just paid, we skip the password creation step. 
            The link sent to your email will take you directly to your assessment results.
          </div>
        </form>
      </CardContent>
    </Card>
  );
}