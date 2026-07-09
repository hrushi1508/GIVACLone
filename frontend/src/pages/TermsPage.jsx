import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-giva-pink hover:text-giva-dark transition font-semibold text-sm uppercase tracking-wider mb-10"
      >
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <h1 className="text-4xl font-serif font-bold text-giva-dark mb-2">Terms of Service</h1>
      <p className="text-sm text-gray-400 mb-10">Last updated: July 2026</p>

      <div className="prose prose-sm max-w-none text-gray-600 space-y-8">
        <section>
          <h2 className="text-xl font-bold text-giva-dark mb-3">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the GIVA website and services, you agree to be bound by these Terms of
            Service. If you do not agree to these terms, please do not use our services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-giva-dark mb-3">2. Products and Pricing</h2>
          <p>
            All products displayed on GIVA are subject to availability. Prices are listed in Indian Rupees
            (₹) and are inclusive of applicable taxes. We reserve the right to modify prices at any time
            without prior notice.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-giva-dark mb-3">3. Orders and Payment</h2>
          <p>
            Placing an order constitutes an offer to purchase the selected items. GIVA reserves the right
            to refuse or cancel any order. Payment must be completed in full before an order is dispatched.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-giva-dark mb-3">4. Returns and Refunds</h2>
          <p>
            We offer a 30-day return policy on all eligible items. Products must be returned in their
            original condition with all packaging. Customised or engraved items are non-returnable unless
            defective.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-giva-dark mb-3">5. Intellectual Property</h2>
          <p>
            All content on the GIVA website — including images, text, logos, and designs — is the
            exclusive property of GIVA and is protected by applicable intellectual property laws.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-giva-dark mb-3">6. Limitation of Liability</h2>
          <p>
            GIVA shall not be liable for any indirect, incidental, or consequential damages arising from
            the use of our services or products beyond the value of the order placed.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-giva-dark mb-3">7. Governing Law</h2>
          <p>
            These terms are governed by the laws of India. Any disputes shall be subject to the exclusive
            jurisdiction of courts in Bangalore, Karnataka.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-giva-dark mb-3">8. Contact</h2>
          <p>
            For questions about these terms, contact us at{' '}
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
