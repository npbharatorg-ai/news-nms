import React from 'react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { useSEO } from '@/hooks/useSEO.jsx';
import { generateBreadcrumbSchema } from '@/utils/schemaGenerator.js';

const PrivacyPolicyPage = () => {
  const lastUpdated = "October 15, 2025";

  const seoTags = useSEO({
    title: 'Privacy Policy',
    description: 'Privacy Policy for Navdhriti Manavadhikar Samachar.',
    url: '/privacy-policy',
    schemas: [
      generateBreadcrumbSchema([
        { name: 'Home', url: 'https://nms.news/' },
        { name: 'Privacy Policy', url: 'https://nms.news/privacy-policy' }
      ])
    ]
  });

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {seoTags}
      <Header />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto prose prose-slate prose-headings:text-slate-900 prose-a:text-brand-blue">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-sm text-slate-500 font-medium mb-12">Last updated: {lastUpdated}</p>

          <section className="mb-10">
            <h2>1. Introduction</h2>
            <p>
              Welcome to Navdhriti Manavadhikar Samachar ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services, including our reporter portal.
            </p>
          </section>

          <section className="mb-10">
            <h2>2. Information We Collect</h2>
            <p>We may collect, use, store, and transfer different kinds of personal data about you, which we have grouped together as follows:</p>
            <ul>
              <li><strong>Identity Data:</strong> First name, last name, username, date of birth, and government-issued ID (Aadhar card) for reporter verification.</li>
              <li><strong>Contact Data:</strong> Email address, telephone numbers, and physical address.</li>
              <li><strong>Financial Data:</strong> Payment details when you subscribe to our premium reporter plans (processed securely via third-party gateways like Razorpay).</li>
              <li><strong>Technical Data:</strong> IP address, browser type and version, time zone setting, and operating system.</li>
              <li><strong>Profile Data:</strong> Your username, password, submitted articles, and preferences.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2>3. How We Use Your Information</h2>
            <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
            <ul>
              <li>To register you as a new reporter and verify your identity.</li>
              <li>To process and deliver your subscription orders.</li>
              <li>To manage our relationship with you, including notifying you about changes to our terms or privacy policy.</li>
              <li>To administer and protect our business and this website.</li>
              <li>To deliver relevant website content and news articles to you.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2>4. Data Protection and Security</h2>
            <p>
              We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors, and other third parties who have a business need to know.
            </p>
          </section>

          <section className="mb-10">
            <h2>5. Your Legal Rights</h2>
            <p>Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:</p>
            <ul>
              <li>Request access to your personal data.</li>
              <li>Request correction of your personal data.</li>
              <li>Request erasure of your personal data.</li>
              <li>Object to processing of your personal data.</li>
              <li>Request restriction of processing your personal data.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2>6. Cookies Policy</h2>
            <p>
              Our website uses cookies to distinguish you from other users of our website. This helps us to provide you with a good experience when you browse our website and also allows us to improve our site. You can set your browser to refuse all or some browser cookies, or to alert you when websites set or access cookies.
            </p>
          </section>

          <section className="mb-10">
            <h2>7. Third-Party Services</h2>
            <p>
              This website may include links to third-party websites, plug-ins, and applications. Clicking on those links or enabling those connections may allow third parties to collect or share data about you. We do not control these third-party websites and are not responsible for their privacy statements.
            </p>
          </section>

          <section className="mb-10">
            <h2>8. Changes to the Privacy Policy</h2>
            <p>
              We keep our privacy policy under regular review. Any changes we make to our privacy policy in the future will be posted on this page and, where appropriate, notified to you by email.
            </p>
          </section>

          <section className="mb-10">
            <h2>9. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
            </p>
            <p className="font-medium">
              Navdhriti Manavadhikar Samachar<br />
              Email: privacy@navdhriti.news<br />
              Phone: +91 141 234 5678
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;