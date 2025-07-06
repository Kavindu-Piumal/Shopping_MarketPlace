import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', userType: '', message: '' });
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus('Your message has been sent successfully!');
        setForm({ name: '', email: '', userType: '', message: '' });
      } else {
        setStatus('Failed to send message. Please try again.');
      }
    } catch {
      setStatus('Failed to send message. Please try again.');
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      {/* Mobile Back Button */}
      <button
        className="lg:hidden flex items-center gap-2 text-emerald-700 mb-4 font-medium hover:underline"
        onClick={() => navigate('/user-menu-mobile')}
      >
        ← Back to My Account
      </button>
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
        <div>
          <label className="block mb-1 font-medium">Name</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block mb-1 font-medium">I am a</label>
          <select name="userType" value={form.userType} onChange={handleChange} required className="w-full border rounded px-3 py-2">
            <option value="">Select...</option>
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">Message</label>
          <textarea name="message" value={form.message} onChange={handleChange} required rows={5} className="w-full border rounded px-3 py-2" />
        </div>
        <button type="submit" className="bg-emerald-600 text-white px-6 py-2 rounded hover:bg-emerald-700 transition">Send Message</button>
        {status && <div className="mt-2 text-center text-sm text-emerald-700">{status}</div>}
      </form>
    </div>
  );
};

export default Contact;
