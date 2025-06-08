import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const PrivacyPolicy = () => {
    const location = useLocation();

    // Scroll to section if hash is present
    useEffect(() => {
        if (location.hash) {
            const element = document.getElementById(location.hash.substring(1));
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [location.hash]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-lime-50 to-green-50">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-emerald-100">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-emerald-800 mb-4">Privacy Policy</h1>
                        <p className="text-emerald-600 text-lg">
                            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
                        </p>
                        <p className="text-sm text-emerald-500 mt-4">
                            <strong>Last Updated:</strong> June 3, 2025
                        </p>
                    </div>
                </div>

                {/* General Privacy Policy Section */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-emerald-100">
                    <h2 className="text-2xl font-bold text-emerald-800 mb-6">General Privacy Policy</h2>
                    
                    <div className="space-y-6">
                        <section>
                            <h3 className="text-xl font-semibold text-emerald-700 mb-3">Information We Collect</h3>
                            <div className="text-gray-700 space-y-2">
                                <p>We collect information you provide directly to us, such as:</p>
                                <ul className="list-disc list-inside ml-4 space-y-1">
                                    <li>Account information (name, email, phone number)</li>
                                    <li>Profile information and preferences</li>
                                    <li>Transaction and order history</li>
                                    <li>Communication with customer support</li>
                                    <li>Product reviews and ratings</li>
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold text-emerald-700 mb-3">How We Use Your Information</h3>
                            <div className="text-gray-700 space-y-2">
                                <p>We use the information we collect to:</p>
                                <ul className="list-disc list-inside ml-4 space-y-1">
                                    <li>Provide and maintain our marketplace services</li>
                                    <li>Process transactions and send order confirmations</li>
                                    <li>Facilitate communication between buyers and sellers</li>
                                    <li>Improve our platform and user experience</li>
                                    <li>Send important updates and promotional communications</li>
                                    <li>Prevent fraud and ensure platform security</li>
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold text-emerald-700 mb-3">Information Sharing</h3>
                            <div className="text-gray-700">
                                <p>We do not sell, trade, or rent your personal information to third parties. We may share your information only in these circumstances:</p>
                                <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
                                    <li>With your explicit consent</li>
                                    <li>To facilitate transactions between buyers and sellers</li>
                                    <li>To comply with legal obligations</li>
                                    <li>To protect our rights and prevent fraud</li>
                                </ul>
                            </div>
                        </section>
                    </div>
                </div>

                {/* Chat Communications Section */}
                <div id="chat-communications" className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-emerald-100">
                    <div className="flex items-center gap-3 mb-6">
                        <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <h2 className="text-2xl font-bold text-emerald-800">Chat Communications Privacy</h2>
                    </div>

                    <div className="space-y-6">
                        <section>
                            <h3 className="text-xl font-semibold text-emerald-700 mb-3">🔒 Data Collection and Use</h3>
                            <div className="bg-emerald-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-emerald-800 mb-2">Chat Messages</h4>
                                <ul className="text-gray-700 space-y-2">
                                    <li><strong>Encryption:</strong> All chat messages are encrypted using industry-standard AES-256-CBC encryption before storage</li>
                                    <li><strong>Purpose:</strong> Chat communications facilitate buyer-seller interactions for product inquiries, order management, and customer support</li>
                                    <li><strong>Retention:</strong> Chat data is retained for 2 years after account closure for legal compliance and dispute resolution</li>
                                    <li><strong>Message Types:</strong> We support text, image, and voice messages - all encrypted equally</li>
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold text-emerald-700 mb-3">👥 Administrative Access</h3>
                            
                            <div className="bg-amber-50 p-4 rounded-lg mb-4">
                                <h4 className="font-semibold text-amber-800 mb-2">When We Access Chat Data</h4>
                                <p className="text-gray-700 mb-2">Platform administrators may access chat communications only in the following circumstances:</p>
                                <ol className="list-decimal list-inside ml-4 space-y-1 text-gray-700">
                                    <li><strong>Dispute Resolution:</strong> When users report disputes requiring investigation</li>
                                    <li><strong>Fraud Prevention:</strong> To investigate suspicious activities or reported fraud</li>
                                    <li><strong>Terms Violation:</strong> When reports of harassment, prohibited content, or policy violations occur</li>
                                    <li><strong>Legal Compliance:</strong> When required by law enforcement or court orders</li>
                                    <li><strong>Safety Concerns:</strong> To prevent harm to users or the platform</li>
                                </ol>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-blue-800 mb-2">Access Controls</h4>
                                <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
                                    <li>All administrative access is logged and audited</li>
                                    <li>Administrators must provide business justification before accessing private communications</li>
                                    <li>Access is limited to authorized personnel on a need-to-know basis</li>
                                    <li>Regular audit reviews ensure proper use of access privileges</li>
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold text-emerald-700 mb-3">⚖️ Your Rights</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <h4 className="font-semibold text-green-800 mb-2">Data Control</h4>
                                    <ul className="text-gray-700 space-y-1">
                                        <li><strong>Data Portability:</strong> Request a copy of your chat data</li>
                                        <li><strong>Deletion:</strong> Delete your chat history (both parties must delete for complete removal)</li>
                                    </ul>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg">
                                    <h4 className="font-semibold text-purple-800 mb-2">Transparency</h4>
                                    <ul className="text-gray-700 space-y-1">
                                        <li><strong>Access Information:</strong> Request information about administrative access to your data</li>
                                        <li><strong>Complaint Process:</strong> Report concerns about data handling to our privacy team</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold text-emerald-700 mb-3">🛡️ Security Measures</h3>
                            
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-semibold text-emerald-800 mb-3">Technical Safeguards</h4>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <ul className="space-y-2 text-gray-700">
                                            <li className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                End-to-end encryption for message content
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                Secure key management and rotation
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                Access logging and monitoring
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                Regular security audits
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-emerald-800 mb-3">Organizational Safeguards</h4>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <ul className="space-y-2 text-gray-700">
                                            <li className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                Staff training on privacy and data protection
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                Principle of least privilege access
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                Regular review of access permissions
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                Incident response procedures
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold text-emerald-700 mb-3">🔄 Chat Features & Privacy</h3>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="bg-blue-50 p-4 rounded-lg text-center">
                                    <svg className="w-8 h-8 text-blue-600 mx-auto mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1h-3a1 1 0 00-1 1v1H8V2a1 1 0 00-1-1H4a1 1 0 00-1 1v2h11zM3 6h18l-1 14H4L3 6z" />
                                    </svg>
                                    <h4 className="font-semibold text-blue-800">Product Inquiries</h4>
                                    <p className="text-sm text-gray-600">Chat directly about products before ordering</p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg text-center">
                                    <svg className="w-8 h-8 text-green-600 mx-auto mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <h4 className="font-semibold text-green-800">Order Management</h4>
                                    <p className="text-sm text-gray-600">Secure communication for order updates</p>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg text-center">
                                    <svg className="w-8 h-8 text-purple-600 mx-auto mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    <h4 className="font-semibold text-purple-800">Chat Deletion</h4>
                                    <p className="text-sm text-gray-600">Control your chat history and data</p>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white rounded-xl shadow-lg p-8 border border-emerald-100">
                    <h2 className="text-2xl font-bold text-emerald-800 mb-6">Contact Information</h2>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-emerald-50 p-6 rounded-lg">
                            <h3 className="text-lg font-semibold text-emerald-800 mb-4">Privacy Concerns</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-gray-700">privacy@sustainablemarketplace.com</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <span className="text-gray-700">+1 (555) 123-PRIVACY</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-6 rounded-lg">
                            <h3 className="text-lg font-semibold text-blue-800 mb-4">Data Protection</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-gray-700">dpo@sustainablemarketplace.com</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    <span className="text-gray-700">Data Protection Officer</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 text-center">
                            For immediate privacy concerns or data deletion requests, please contact our privacy team. 
                            We respond to all privacy inquiries within 72 hours.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-gray-500 text-sm">
                        This privacy policy is part of our commitment to protecting your data and maintaining transparency 
                        in our sustainable marketplace ecosystem.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
