import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import ContactForm from '@/components/ContactForm.jsx';
import AdsDisplay from '@/components/AdsDisplay.jsx';
import { useSEO } from '@/hooks/useSEO.jsx';
import { generateBreadcrumbSchema } from '@/utils/schemaGenerator.js';
const ContactPage = () => {
  const seoTags = useSEO({
    title: 'Contact Us',
    description: 'Get in touch with Navdhriti Manavadhikar Samachar. We would love to hear from you.',
    url: '/contact',
    schemas: [generateBreadcrumbSchema([{
      name: 'Home',
      url: 'https://nms.news/'
    }, {
      name: 'Contact Us',
      url: 'https://nms.news/contact'
    }])]
  });
  return <div className="min-h-screen flex flex-col bg-slate-50">
      {seoTags}
      <Header />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto mb-8">
          <AdsDisplay />
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
              Get in Touch
            </h1>
            <p className="text-lg text-slate-600">
              Have a news tip, a question about our reporter program, or general feedback? Fill out the form below and our team will get back to you promptly.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1 space-y-6">
              <Card className="border-slate-200 shadow-sm bg-white">
                <CardContent className="p-6 space-y-8">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 mb-6 border-b pb-2">Contact Details</h2>
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                          <MapPin className="w-5 h-5 text-brand-blue" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">Head Office</p>
                          <p className="text-sm text-slate-600 mt-1">Navdhriti Manavadhikar Samachar<br />Jaipur, Rajasthan, India</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                          <Phone className="w-5 h-5 text-brand-blue" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">Phone</p>
                          <p className="text-sm text-slate-600 mt-1">+91 9251120059</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                          <Mail className="w-5 h-5 text-brand-blue" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">Email</p>
                          <p className="text-sm text-slate-600 mt-1">info@nms.news</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                          <Clock className="w-5 h-5 text-brand-blue" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">Office Hours</p>
                          <p className="text-sm text-slate-600 mt-1">Mon - Sat: 9:00 AM - 6:00 PM<br />Sunday: Closed</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="rounded-xl overflow-hidden h-64 bg-slate-200 border border-slate-200 relative">
                <div className="absolute inset-0 flex items-center justify-center flex-col text-slate-500">
                  <MapPin className="w-8 h-8 mb-2 opacity-50" />
                  <span className="text-sm font-medium">Interactive Map Area</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <Card className="border-slate-200 shadow-md bg-white h-full">
                <CardContent className="p-8 md:p-10">
                  <h2 className="text-2xl font-bold text-slate-900 mb-8">Send us a Message</h2>
                  <ContactForm />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-12">
          <AdsDisplay />
        </div>
      </main>

      <Footer />
    </div>;
};
export default ContactPage;