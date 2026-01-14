import React from 'react';
import Layout from '../components/Layout';
import { Shield, Lock, Eye, Cookie, FileText } from 'lucide-react';

export default function PrivacyPolicy() {
    return (
        <Layout>
            <div className="px-4 md:px-0 max-w-2xl mx-auto py-8">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                        <Shield size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Privacy Policy</h1>
                        <p className="text-[var(--text-muted)] font-bold text-sm uppercase tracking-widest">Last Updated: January 2026</p>
                    </div>
                </div>

                <div className="space-y-8 text-[var(--text)] leading-relaxed">
                    <section className="bg-[var(--card)] p-6 rounded-[32px] border border-[var(--border)]">
                        <div className="flex items-center gap-3 mb-4">
                            <Lock className="text-pink-500" size={20} />
                            <h2 className="text-xl font-black">1. Information We Collect</h2>
                        </div>
                        <p className="font-medium opacity-80 mb-4">
                            Japap is built on anonymity. We do not require your real name, email, or phone number to browse or post scoop.
                        </p>
                        <ul className="list-disc list-inside space-y-2 font-bold text-sm opacity-70">
                            <li>Anonymized User ID (for session management)</li>
                            <li>Pseudo/Alias and Avatar choice</li>
                            <li>Public posts and comments you share</li>
                            <li>Device information for security and anti-spam</li>
                        </ul>
                    </section>

                    <section className="bg-[var(--card)] p-6 rounded-[32px] border border-[var(--border)]">
                        <div className="flex items-center gap-3 mb-4">
                            <Cookie className="text-blue-500" size={20} />
                            <h2 className="text-xl font-black">2. Cookies & Advertisements</h2>
                        </div>
                        <p className="font-medium opacity-80 mb-4">
                            We use Google AdSense to serve advertisements. Google may use cookies to serve ads based on your visits to our site and other sites on the internet.
                        </p>
                        <p className="font-medium opacity-80">
                            Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" className="text-[var(--brand)] underline">Google Ad Settings</a>.
                        </p>
                    </section>

                    <section className="bg-[var(--card)] p-6 rounded-[32px] border border-[var(--border)]">
                        <div className="flex items-center gap-3 mb-4">
                            <Eye className="text-purple-500" size={20} />
                            <h2 className="text-xl font-black">3. Content Transparency</h2>
                        </div>
                        <p className="font-medium opacity-80">
                            User content is ephemeral and is generally removed after a period of 7 days. We do not sell your personal data to third parties.
                        </p>
                    </section>

                    <section className="bg-[var(--card)] p-6 rounded-[32px] border border-[var(--border)]">
                        <div className="flex items-center gap-3 mb-4">
                            <FileText className="text-amber-500" size={20} />
                            <h2 className="text-xl font-black">4. Contact Us</h2>
                        </div>
                        <p className="font-medium opacity-80">
                            For any privacy concerns, reach out anonymously through our feedback system or at support@japap.app.
                        </p>
                    </section>
                </div>
            </div>
        </Layout>
    );
}
