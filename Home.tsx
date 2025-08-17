// src/Home.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // IMPORTANT: Import Link for navigation
import { Star, Search, Mail, Home as HomeIcon } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Supabase client initialization (stays with the component that uses it)
const supabaseUrl = 'https://nfgwdqufpjscnptnkgtr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mZ3dkcXVmcGpzY25wdG5rZ3RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4NzI2NDAsImV4cCI6MjA2MDQ0ODY0MH0.gH4_yiHkuuKCoNibgdZul1nDCFmro7Zc8VhD8vwBSPo';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function Home() {
    const [formData, setFormData] = useState({
        wishlist: '',
        name: '',
        gender: '',
        email: '',
        budget: '',
        location: '',
        heard_about_us: '',
        buyer_confirm: false,
    });

    const [contactForm, setContactForm] = useState({
        email: '',
        message: '',
    });

    // --- All your handleSubmit, handleContactSubmit, etc. functions go here ---
    // (Copy them from your App.tsx, no changes needed to the functions themselves)
    const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.buyer_confirm) {
      alert('Please confirm you are actively looking to purchase a property.');
      return;
    }
    try {
      const { data, error } = await supabase
        .from('property_requests')
        .insert([{
          wishlist: formData.wishlist,
          name: formData.name,
          gender: formData.gender,
          email: formData.email,
          budget: formData.budget,
          location: formData.location,
          heard_about_us: formData.heard_about_us,
          buyer_confirm: formData.buyer_confirm,
        }]);
      if (error) {
        console.error('Error submitting property request:', error);
        alert(`Failed to submit property request: ${error.message}.`);
      } else {
        console.log('Property request submitted successfully:', data);
        alert('Your property request has been submitted successfully!');
        setFormData({ wishlist: '', name: '', gender: '', email: '', budget: '', location: '', heard_about_us: '', buyer_confirm: false });
      }
    } catch (unexpectedError) {
      console.error('An unexpected error occurred:', unexpectedError);
      alert('An unexpected error occurred during submission.');
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .insert([{ email: contactForm.email, message: contactForm.message }]);
      if (error) {
        console.error('Error submitting contact message:', error);
        alert(`Failed to send message: ${error.message}.`);
      } else {
        console.log('Contact message sent successfully:', data);
        alert('Your message has been sent successfully!');
        setContactForm({ email: '', message: '' });
      }
    } catch (unexpectedError) {
      console.error('An unexpected error occurred:', unexpectedError);
      alert('An unexpected error occurred during message submission.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  };


    return (
        <div className="min-h-screen flex flex-col font-sans">
            {/* --- All your header and main content JSX goes here --- */}
            {/* (Copy it from your App.tsx, the only change is in the footer) */}
            <header className="bg-white p-12 text-center">
                <div className="relative">
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                        <div className="w-12 h-6 border-t-2 border-teal-500 flex items-center justify-center">
                            <HomeIcon className="w-4 h-4 text-teal-500" />
                        </div>
                    </div>
                </div>
                <h1 className="text-5xl font-light text-teal-900 mb-4">Dream Property Connector</h1>
                <p className="text-teal-600 mb-4">Linking Sydney (Australia) Buyers to Better-Matched Opportunities</p>
                <p className="text-teal-600 mb-4">Free Property Matching for Active Buyers Only | We connect qualified buyers to trusted agents | You enjoy the service free — agents connect with you directly</p>
                <div className="inline-block px-6 py-2 rounded-full bg-teal-50 text-teal-700 mb-2 mr-2">
                    Free Property Matching Service
                </div>
                <div className="inline-block px-6 py-2 rounded-full bg-teal-50 text-teal-700">
                    ABN: 58465658836
                </div>
            </header>
            <main className="flex-1 flex flex-col md:flex-row">
            <div className="w-full md:w-1/2 bg-teal-100 p-8 md:p-12 flex items-center justify-center">
                <div className="w-full max-w-md">
                    <div className="bg-white/50 backdrop-blur-sm p-8 rounded-2xl shadow-lg">
                        <h2 className="text-2xl font-light text-teal-900 mb-6 text-center">Find Your Dream Property</h2>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="location" className="block text-sm text-teal-900">Preferred Location:</label>
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    placeholder="e.g., Sydney (Australia), Ryde, North Sydney — within NSW only"
                                    className="w-full px-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="budget" className="block text-sm text-teal-900">Budget Range:</label>
                                <input
                                    type="text"
                                    id="budget"
                                    name="budget"
                                    placeholder="e.g. $1.2M - $1.5M"
                                    className="w-full px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                    value={formData.budget}
                                    onChange={handleInputChange}
                                />
                                <small className="block mt-1 text-xs text-gray-600 leading-snug">
                                    Please enter your estimated purchase budget (e.g. 1.2m = $1,200,000). This service is exclusively for active buyers — <span className="text-red-500"> not rentals</span>.
                                </small>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="wishlist" className="block text-sm text-teal-900">Property Requirements:</label>
                                <textarea
                                    id="wishlist"
                                    name="wishlist"
                                    placeholder="e.g., Unit/House/type 3 bedrooms, 2 bathrooms, garden, close to schools"
                                    rows={3}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                                    value={formData.wishlist}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="name" className="block text-sm text-teal-900">
                                    Your Full Name:
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    placeholder="e.g. John Smith / Jane Lim"
                                    className="w-full px-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                />
                                <small className="block mt-1 text-xs text-gray-600 leading-snug">
                                    We only share your surname until an agent agrees to a verified match. Your full name is included once the agent commits through our secure platform, ensuring privacy and legitimacy for both parties.
                                </small>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm text-teal-900">Gender:</label>
                                <div className="flex space-x-4">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="Male"
                                            className="mr-2 text-teal-500 focus:ring-teal-500"
                                            checked={formData.gender === 'Male'}
                                            onChange={handleInputChange}
                                        />
                                        <span className="text-teal-900">Male</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="Female"
                                            className="mr-2 text-teal-500 focus:ring-teal-500"
                                            checked={formData.gender === 'Female'}
                                            onChange={handleInputChange}
                                        />
                                        <span className="text-teal-900">Female</span>
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-sm text-teal-900">Email Address:</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className="w-full px-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="heard_about_us" className="block text-sm text-teal-900">How you heard about us:</label>
                                <input
                                    type="text"
                                    id="heard_about_us"
                                    name="heard_about_us"
                                    placeholder="e.g., Google Search, Google Ads, Facebook, Instagram, YouTube, Friend/Referral"
                                    className="w-full px-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    value={formData.heard_about_us}
                                    onChange={handleInputChange}
                                    title="Common sources: Google Search, Google Ads, Facebook, Instagram, YouTube, Friend/Referral, or enter your own"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center space-x-2 text-sm text-teal-900 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="buyer_confirm"
                                        className="accent-teal-600"
                                        checked={formData.buyer_confirm}
                                        onChange={handleInputChange}
                                    />
                                    <span>I confirm I'm actively looking to purchase a property (not renting).</span>
                                </label>
                            </div>

                            <button
                                onClick={handleSubmit}
                                className="w-full bg-teal-600 text-white px-5 py-3 rounded-full hover:bg-teal-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                disabled={!formData.buyer_confirm}
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-full md:w-1/2 relative min-h-[600px]">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: 'url(https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)'
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                <div className="relative z-10 p-8">
                    <div id="contact" className="mt-4 bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg max-w-sm">
                        <h3 className="text-xl font-light mb-4 text-teal-900 flex items-center">
                            <Mail className="w-5 h-5 mr-2" />
                            Contact Us
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="contact-email" className="block text-sm text-teal-900 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    id="contact-email"
                                    name="email"
                                    className="w-full px-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    value={contactForm.email}
                                    onChange={handleContactChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-sm text-teal-900 mb-1">Message</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows={4}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                                    value={contactForm.message}
                                    onChange={handleContactChange}
                                />
                            </div>
                            <button
                                onClick={handleContactSubmit}
                                className="w-full bg-teal-600 text-white py-2 px-6 rounded-full hover:bg-teal-700 transition-colors"
                            >
                                Send Message
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>

            {/* ========== MODIFIED FOOTER SECTION ========== */}
            <footer className="bg-teal-900 text-white py-8 px-8">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-xl font-light mb-4 flex items-center">
                            <HomeIcon className="w-5 h-5 mr-2" />
                            Dream Property Connector
                        </h3>
                        <p className="text-teal-200 text-sm">
                            We connect property seekers with their dream homes through our personalized matching service.
                        </p>
                    </div>
                    
                    <div>
                        <h3 className="text-xl font-light mb-4">Site Links</h3>
                        <ul className="space-y-2 text-teal-200">
                            {/* Use Link component for internal navigation */}
                            <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                            <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>
                    
                    <div>
                        <h3 className="text-xl font-light mb-4">Contact Us</h3>
                        <address className="not-italic text-teal-200 text-sm space-y-2">
                            <p>Email: info@sydneydpc.com</p>
                            <p>ABN: 58465658836</p>
                        </address>
                    </div>
                </div>
                
                <div className="mt-8 pt-8 border-t border-teal-800 text-center text-teal-300 text-sm">
                    <p>© {new Date().getFullYear()} Dream Property Connector. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

export default Home;