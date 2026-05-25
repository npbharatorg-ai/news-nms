import React from 'react';
import { Target, Eye, Shield, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import AdsDisplay from '@/components/AdsDisplay.jsx';
import { useSEO } from '@/hooks/useSEO.jsx';
import { generateBreadcrumbSchema } from '@/utils/schemaGenerator.js';

const AboutPage = () => {
  const seoTags = useSEO({
    title: 'About Us',
    description: 'Learn about Navdhriti Manavadhikar Samachar, our mission, vision, and the team behind the news.',
    url: '/about',
    schemas: [
      generateBreadcrumbSchema([
        { name: 'Home', url: 'https://nms.news/' },
        { name: 'About Us', url: 'https://nms.news/about' }
      ])
    ]
  });

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {seoTags}
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <AdsDisplay />
        </div>

        <section className="relative py-24 lg:py-32 bg-slate-950 overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://horizons-cdn.hostinger.com/7a26f45c-f82c-40d2-8cdd-8c9eef29992b/317062cd3ddf37d25cf4db6900eccfb3.jpg')] bg-cover bg-center mix-blend-overlay"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
                Empowering Citizens Through <span className="text-brand-blue">Truth & Transparency</span>
              </h1>
              <p className="text-xl text-slate-300 leading-relaxed mb-8">
                Navdhriti Manavadhikar Samachar is dedicated to bringing you unbiased, accurate, and timely news from the grassroots level to the national stage.
              </p>
            </div>
          </div>
        </section>

        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
              <div className="order-2 lg:order-1">
                <div className="w-16 h-16 bg-blue-100 text-brand-blue rounded-2xl flex items-center justify-center mb-6">
                  <Target className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Mission</h2>
                <p className="text-lg text-slate-600 leading-relaxed mb-6">
                  To provide a fearless platform for journalism that highlights human rights issues, exposes corruption, and amplifies the voices of the marginalized. We strive to build a network of dedicated reporters who are committed to ethical reporting and social justice.
                </p>
                <ul className="space-y-3 text-slate-700">
                  <li className="flex items-center gap-3"><Shield className="w-5 h-5 text-brand-blue" /> Unbiased and factual reporting</li>
                  <li className="flex items-center gap-3"><Shield className="w-5 h-5 text-brand-blue" /> Focus on human rights and social issues</li>
                  <li className="flex items-center gap-3"><Shield className="w-5 h-5 text-brand-blue" /> Empowering local journalists</li>
                </ul>
              </div>
              <div className="order-1 lg:order-2">
                <img 
                  src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2070&auto=format&fit=crop" 
                  alt="Journalists working together" 
                  className="rounded-2xl shadow-xl w-full h-[400px] object-cover"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <img 
                  src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop" 
                  alt="Global connectivity" 
                  className="rounded-2xl shadow-xl w-full h-[400px] object-cover"
                />
              </div>
              <div>
                <div className="w-16 h-16 bg-red-100 text-brand-red rounded-2xl flex items-center justify-center mb-6">
                  <Eye className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Vision</h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                  We envision a society where information flows freely and accurately, where every citizen is aware of their rights, and where journalism serves as a true pillar of democracy. Through Navdhriti Manavadhikar Samachar, we aim to create the most trusted network of news reporters across India.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Users className="w-16 h-16 text-slate-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Join Our Network of Reporters</h2>
            <p className="text-lg text-slate-600 mb-10 leading-relaxed">
              Are you passionate about uncovering the truth? We are constantly expanding our network of dedicated journalists across districts and states. Join us to get your official Press ID and start publishing stories that matter.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="w-full sm:w-auto text-lg h-14 px-8">
                <Link to="/reporter-register">Become a Reporter <ArrowRight className="ml-2 w-5 h-5" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto text-lg h-14 px-8">
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-border">
          <AdsDisplay />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;