import { Suspense } from 'react';
import PostPurchaseAuthGate from '@/components/auth/PostPurchaseAuthGate';
import { Loader2 } from 'lucide-react';

/**
 * Checkout Success Page
 * 
 * Replaces the previous "3-5 click" gauntlet.
 * 
 * Old Flow:
 * 1. Payment Success
 * 2. "Create Account" Page
 * 3. "I have one" or "Create" selection
 * 4. Form Fill
 * 5. Email Verification Page (Confusing "Change Email" state)
 * 
 * New Flow (Issue #463 Fix):
 * 1. Payment Success
 * 2. Direct "Email Me a Sign-In Link" (1 click)
 * 3. User clicks link -> Lands directly on Assessment Dashboard
 */
export default function CheckoutSuccessPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-4xl text-center">
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Payment Successful!
        </h1>
        <p className="mb-8 text-lg text-gray-600">
          Your In-Depth Assessment ($99) is ready. Let's get you access.
        </p>
        
        <Suspense fallback={
          <div className="flex justify-center">
            <Loader2 className="h-8 w-4 animate-spin text-primary" />
          </div>
        }>
          <PostPurchaseAuthGate />
        </Suspense>
      </div>
    </div>
  );
}