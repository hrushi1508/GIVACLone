import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-giva-pink hover:text-giva-dark transition font-semibold text-sm uppercase tracking-wider mb-10"
      >
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <h1 className="text-4xl font-serif font-bold text-giva-dark mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-400 mb-10">Last updated: July 2026</p>

      <div className="prose prose-sm max-w-none text-gray-600 space-y-8">
        <section>
          <h2 className="text-xl font-bold text-giva-dark mb-3">1. Information We Collect</h2>
          <p>
            We collect information you provide directly: name, email address, shipping address, and order
            history. We also collect usage data such as pages visited and products viewed to improve your
            shopping experience.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-giva-dark mb-3">2. How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>To process and fulfil your orders</li>
            <li>To send order confirmations and shipping updates</li>
            <li>To improve our website and personalise your experience</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-giva-dark mb-3">3. Data Security</h2>
          <p>
            All passwords are stored using industry-standard hashing algorithms. Your data is transmitted
            over HTTPS. We do not store payment card details — all transactions are handled by certified
            payment processors.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-giva-dark mb-3">4. Cookies</h2>
          <p>
            We use session storage to maintain your login state and shopping cart. We do not use
            third-party tracking cookies. You may clear browser storage at any time to reset your session.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-giva-dark mb-3">5. Data Sharing</h2>
          <p>
            We do not sell your personal data. We share data only with third-party service providers
            necessary to operate our business (e.g., logistics partners for delivery), under strict
            confidentiality agreements.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-giva-dark mb-3">6. Your Rights</h2>
          <p>
            You may request access to, correction of, or deletion of your personal data at any time by
            contacting us. Account deletion removes your profile, order history, and cart data from our
            systems within 30 days.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-giva-dark mb-3">7. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy periodically. Significant changes will be communicated via
            email or a notice on our website. Continued use of our services after changes constitutes
            acceptance.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-giva-dark mb-3">8. Contact</h2>
          <p>
            For privacy-related questions or data requests, email{' '}
            <a href="mailto:care@giva.co" className="text-giva-pink hover:underline">
              care@giva.co
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
