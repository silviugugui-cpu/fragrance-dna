import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3 text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-gold">Password Recovery</p>
        <h1 className="text-4xl font-light text-white">Password reset unavailable</h1>
        <p className="text-gray-400">Email delivery is not configured for this project yet.</p>
      </div>

      <div role="status" className="premium-card-dark space-y-4 p-8">
        <p className="text-sm leading-6 text-gray-300">
          Contact the platform administrator to reset this account. An email reset link will be available after a verified email provider and reset-token flow are configured.
        </p>
        <Link href="/auth/sign-in" className="inline-flex rounded border border-gold/30 px-4 py-2 text-sm font-semibold text-gold hover:bg-gold/10">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}