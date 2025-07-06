import React from 'react';
import { useNavigate } from 'react-router-dom';

const TermsOfService = () => {
  const navigate = useNavigate();
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      {/* Mobile Back Button */}
      <button
        className="lg:hidden flex items-center gap-2 text-emerald-700 mb-4 font-medium hover:underline"
        onClick={() => navigate('/user-menu-mobile')}
      >
        ← Back to My Account
      </button>
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="mb-4">Welcome to EcoMarket! By accessing or using our platform, you agree to comply with and be bound by the following terms and conditions. Please read them carefully.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">1. Acceptance of Terms</h2>
      <p className="mb-4">By using EcoMarket, you agree to these Terms of Service and our Privacy Policy. If you do not agree, please do not use our services.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">2. User Responsibilities</h2>
      <p className="mb-4">You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account. You agree to provide accurate information and to update it as necessary.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">3. Prohibited Activities</h2>
      <p className="mb-4">You may not use EcoMarket for any unlawful purpose or in violation of any applicable laws. Fraudulent, abusive, or otherwise harmful activities are strictly prohibited.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">4. Intellectual Property</h2>
      <p className="mb-4">All content on EcoMarket, including text, graphics, logos, and images, is the property of EcoMarket or its licensors and is protected by copyright laws.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">5. Limitation of Liability</h2>
      <p className="mb-4">EcoMarket is provided on an "as is" and "as available" basis. We are not liable for any damages arising from your use of the platform.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">6. Changes to Terms</h2>
      <p className="mb-4">We reserve the right to update these Terms of Service at any time. Continued use of EcoMarket after changes constitutes acceptance of the new terms.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">7. Contact Us</h2>
      <p>If you have any questions about these Terms, please contact us via the Contact page.</p>
    </div>
  );
};

export default TermsOfService;
