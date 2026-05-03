import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { GOOGLE_SHEET_URL } from '../config/constants';
import toast from 'react-hot-toast';

export const ContactPage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!GOOGLE_SHEET_URL) {
      toast.error('Google Sheet URL not configured. Please see the setup guide.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create FormData to send as URLSearchParams (standard for Google Apps Script)
      const params = new URLSearchParams();
      params.append('timestamp', new Date().toLocaleString());
      params.append('type', 'contact');
      params.append('name', formData.name);
      params.append('email', formData.email);
      params.append('subject', formData.subject);
      params.append('message', formData.message);

      // We use 'no-cors' because Google Apps Script redirects can cause CORS issues
      // and we don't necessarily need to read the JSON response if it's successful
      await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      toast.success('Message sent! We will get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 page-enter">
      <div className="text-center mb-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-surface-900 dark:text-white mb-4">
          Contact Our Team
        </h1>
        <p className="text-lg text-surface-600 dark:text-surface-400 max-w-2xl mx-auto">
          Have questions about an order, a product, or just want to say hi? We're here to help.
          Fill out the form below and we'll respond within 24 hours.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Contact Information */}
        <div className="lg:col-span-1 space-y-8">
          <div className="glass-card p-8 space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="font-semibold text-surface-900 dark:text-white mb-1">Email Us</h3>
                <p className="text-sm text-surface-500 mb-2">Our friendly team is here to help.</p>
                <a href="mailto:support@thegreat.com" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
                  support@thegreat.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center shrink-0">
                <MessageSquare className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="font-semibold text-surface-900 dark:text-white mb-1">Live Chat</h3>
                <p className="text-sm text-surface-500 mb-2">Available Mon-Fri, 9am-5pm EST.</p>
                <button className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
                  Start a conversation
                </button>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="font-semibold text-surface-900 dark:text-white mb-1">Office</h3>
                <p className="text-sm text-surface-500 mb-2">Come say hello at our HQ.</p>
                <p className="text-primary-600 dark:text-primary-400 font-medium">
                  123 Design Street, Creative Valley<br />San Francisco, CA 94103
                </p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-surface-100 dark:border-surface-800">
              <div className="flex items-center gap-2 text-surface-500 text-sm">
                <Clock className="w-4 h-4" />
                <span>Current local time: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="glass-card p-8 sm:p-10 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                placeholder="John Doe"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="john@example.com"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <Input
              label="Subject"
              placeholder="How can we help you?"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
                Message
              </label>
              <textarea
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 focus:ring-2 focus:ring-primary-500/50 outline-none min-h-[160px] text-surface-900 dark:text-white transition-all text-sm"
                placeholder="Tell us more about your inquiry..."
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>

            <Button type="submit" loading={isSubmitting} className="w-full sm:w-auto px-10">
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
