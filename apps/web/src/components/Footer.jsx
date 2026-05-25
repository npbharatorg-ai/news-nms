import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, Facebook, Twitter, Instagram, Youtube, MapPin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    {
      name: 'Home',
      path: '/'
    },
    {
      name: 'Categories',
      path: '/categories'
    },
    {
      name: 'About',
      path: '/about'
    },
    {
      name: 'Contact',
      path: '/contact'
    }
  ];

  const socialLinks = [
    {
      icon: Facebook,
      href: 'https://www.facebook.com/share/18W2pWhLKT/',
      label: 'Facebook'
    },
    {
      icon: Twitter,
      href: 'https://x.com/nmsnews2050',
      label: 'Twitter'
    },
    {
      icon: Instagram,
      href: '',
      label: 'Instagram'
    },
    {
      icon: Youtube,
      href: 'https://www.youtube.com/@nmsnews2050',
      label: 'YouTube Channel'
    }
  ];

  return (
    <footer className="bg-secondary text-secondary-foreground pt-16 pb-8 border-t-4 border-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* About Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <img src="https://nms.news/wp-content/uploads/2026/05/nms.jpeg" alt="NMS NEWS" className="h-12 w-12 bg-white rounded-lg p-1 object-contain" />
              <span className="font-extrabold text-xl tracking-tight text-white leading-tight">
                NMS<br /><span className="text-primary">NEWS</span>
              </span>
            </div>
            <p className="text-secondary-foreground/70 text-sm leading-relaxed">
              Sach Saahas Nyaay Kee Khabar. Your trusted source for daily news, delivering accurate, timely, and impactful stories that matter to you and our community.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-white border-b-2 border-primary inline-block pb-1">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map(link => (
                <li key={link.name}>
                  <Link to={link.path} className="text-secondary-foreground/80 hover:text-primary transition-colors flex items-center gap-2 group">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-white border-b-2 border-primary inline-block pb-1">Contact Info</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-secondary-foreground/80">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">Jaipur <br />Rajasthan, India 302001</span>
              </li>
              <li className="flex items-center gap-3 text-secondary-foreground/80">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <a href="tel:+919251120059" className="text-sm hover:text-primary transition-colors">+91 9251120059</a>
              </li>
              <li className="flex items-center gap-3 text-secondary-foreground/80">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <a href="mailto:info@nms.news" className="text-sm hover:text-primary transition-colors">info@nms.news</a>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-white border-b-2 border-primary inline-block pb-1">Follow Us</h3>
            <p className="text-sm text-secondary-foreground/70 mb-4">
              Stay connected with us on social media for live updates and breaking news.
            </p>
            <div className="flex gap-3">
              {socialLinks.map(social => {
                const Icon = social.icon;
                return (
                  <a 
                    key={social.label} 
                    href={social.href} 
                    aria-label={social.label} 
                    className="h-10 w-10 rounded-full bg-secondary-foreground/10 flex items-center justify-center text-white hover:bg-primary hover:scale-110 transition-all duration-300"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-secondary-foreground/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-secondary-foreground/60 text-center md:text-left">
            © {currentYear} Navdhriti Manavadhikar Samachar. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-secondary-foreground/60">
            <Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/terms-conditions" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;