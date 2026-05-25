import React from 'react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { useSEO } from '@/hooks/useSEO.jsx';
import { generateBreadcrumbSchema } from '@/utils/schemaGenerator.js';

const TermsConditionsPage = () => {
  const lastUpdated = "October 15, 2025";

  const seoTags = useSEO({
    title: 'Terms & Conditions',
    description: 'Terms and Conditions for using Navdhriti Manavadhikar Samachar services.',
    url: '/terms-conditions',
    schemas: [
      generateBreadcrumbSchema([
        { name: 'Home', url: 'https://nms.news/' },
        { name: 'Terms & Conditions', url: 'https://nms.news/terms-conditions' }
      ])
    ]
  });

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {seoTags}
      <Header />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto prose prose-slate prose-headings:text-slate-900 prose-a:text-brand-blue">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">Terms & Conditions</h1>
          <p className="text-sm text-slate-500 font-medium mb-12">Last updated: {lastUpdated}</p>

          <section className="mb-10">
            <h2>1. Introduction</h2>
            <p>
              These Terms and Conditions govern your use of the Navdhriti Manavadhikar Samachar website and services. By accessing or using our platform, you agree to be bound by these terms. If you disagree with any part of the terms, you may not access the service.
            </p>
          </section>

          <section className="mb-10">
            <h2>2. User Responsibilities</h2>
            <p>As a user or registered reporter on our platform, you agree to:</p>
            <ul>
              <li>Provide accurate, current, and complete information during registration.</li>
              <li>Maintain the security of your password and account credentials.</li>
              <li>Take full responsibility for all activities that occur under your account.</li>
              <li>Not use the platform for any illegal or unauthorized purpose.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2>3. Content Policy & Reporter Conduct</h2>
            <p>For registered reporters submitting news articles:</p>
            <ul>
              <li>All submitted content must be factually accurate and verified.</li>
              <li>Plagiarism, fake news, and defamatory content are strictly prohibited.</li>
              <li>You must hold the copyright or have permission to use any images or media submitted.</li>
              <li>The editorial team reserves the right to edit, reject, or remove any submission without prior notice.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2>4. Intellectual Property</h2>
            <p>
              The service and its original content (excluding content provided by users), features, and functionality are and will remain the exclusive property of Navdhriti Manavadhikar Samachar and its licensors. The platform is protected by copyright, trademark, and other laws of India.
            </p>
          </section>

          <section className="mb-10">
            <h2>5. Disclaimer</h2>
            <p>
              Your use of the service is at your sole risk. The service is provided on an "AS IS" and "AS AVAILABLE" basis. The service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement, or course of performance.
            </p>
          </section>

          <section className="mb-10">
            <h2>6. Limitation of Liability</h2>
            <p>
              In no event shall Navdhriti Manavadhikar Samachar, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.
            </p>
          </section>

          <section className="mb-10">
            <h2>7. Service Termination</h2>
            <p>
              We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the service will immediately cease.
            </p>
          </section>

          <section className="mb-10">
            <h2>8. Governing Law</h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws of India, specifically the jurisdiction of Rajasthan, without regard to its conflict of law provisions.
            </p>
          </section>

          <section className="mb-10">
            <h2>9. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <p className="font-medium">
              Navdhriti Manavadhikar Samachar<br />
              Email: legal@navdhriti.news<br />
              Phone: +91 141 234 5678
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsConditionsPage;