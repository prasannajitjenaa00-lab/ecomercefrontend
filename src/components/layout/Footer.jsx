import React from 'react';
import { Link } from 'react-router-dom';
import { FiInstagram, FiFacebook, FiTwitter, FiYoutube, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const footerLinks = {
  'Men': ['T-Shirts', 'Shirts', 'Jeans', 'Jackets', 'Shoes', 'Accessories'],
  'Women': ['Sarees', 'Kurtis', 'Dresses', 'Handbags', 'Jewellery', 'Footwear'],
  'Company': ['About Us', 'Careers', 'Press', 'Blog', 'Sustainability', 'Sitemap'],
  'Support': ['Contact Us', 'FAQs', 'Size Guide', 'Track Order', 'Returns', 'Terms of Service'],
};

export default function Footer() {
  return (
    <footer className="bg-dark-950 text-stone-400 font-body">
      {/* Newsletter */}
      <div className="border-b border-dark-800">
        <div className="container mx-auto px-4 lg:px-8 py-12 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-display text-2xl text-white mb-1">Stay in the Loop</h3>
            <p className="text-sm">Get exclusive offers, new arrivals & style inspiration.</p>
          </div>
          <form className="flex w-full max-w-md" onSubmit={e => e.preventDefault()}>
            <input type="email" placeholder="Your email address"
              className="flex-1 bg-dark-900 border border-dark-700 text-white px-4 py-3 text-sm rounded-l focus:outline-none focus:border-gold-400 transition-colors" />
            <button type="submit" className="bg-gold-400 text-dark-950 px-6 py-3 text-sm font-semibold tracking-widest uppercase rounded-r hover:bg-gold-300 transition-colors whitespace-nowrap">
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <h1 className="font-display text-2xl font-bold text-white mb-4">
              <img src="./logo.png" alt="Thankles fashion" />
            </h1>
            <p className="text-sm leading-relaxed mb-6">
              Premium fashion for the modern Indian. Celebrating craftsmanship, style, and heritage.
            </p>
            <div className="flex space-x-4">
              {[FiInstagram, FiFacebook, FiTwitter, FiYoutube].map((Icon, i) => (
                <a key={i} href="#" className="text-dark-500 hover:text-gold-400 transition-colors p-2 border border-dark-700 rounded hover:border-gold-400">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-white font-semibold text-sm tracking-widest uppercase mb-4">{title}</h4>
              <ul className="space-y-2">
                {links.map(link => (
                  <li key={link}>
                    <Link to="#" className="text-sm hover:text-gold-400 transition-colors">{link}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="mt-12 pt-8 border-t border-dark-800 grid md:grid-cols-3 gap-6">
          {[[FiMapPin, 'Address', 'Unit 4, Saheed Nagar, Bhubaneswar, Odisha 751007'],
            [FiPhone, 'Phone', '+91 9876543210'],
            [FiMail, 'Email', 'support@thankless.com']
          ].map(([Icon, label, value]) => (
            <div key={label} className="flex items-start space-x-3">
              <Icon size={18} className="text-gold-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-white text-sm font-medium">{label}</p>
                <p className="text-sm">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-dark-800 py-6">
        <div className="container mx-auto px-4 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-dark-600">© 2024 Thankless Fashion. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png" alt="Visa" className="h-5 opacity-50 filter grayscale hover:opacity-80 transition-opacity" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/MasterCard_Logo.svg/200px-MasterCard_Logo.svg.png" alt="Mastercard" className="h-5 opacity-50 filter grayscale hover:opacity-80 transition-opacity" />
            <span className="text-xs text-dark-600 border border-dark-700 px-2 py-1 rounded">UPI</span>
            <span className="text-xs text-dark-600 border border-dark-700 px-2 py-1 rounded">COD</span>
          </div>
          <div className="flex space-x-4 text-xs">
            <Link to="#" className="hover:text-gold-400 transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-gold-400 transition-colors">Terms</Link>
            <Link to="#" className="hover:text-gold-400 transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
