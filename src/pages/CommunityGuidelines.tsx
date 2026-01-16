import React from 'react';
import Layout from '../components/Layout';
import AdUnit from '../components/AdUnit';
import { BookOpen, Heart, UserX, AlertTriangle, CheckCircle } from 'lucide-react';

export default function CommunityGuidelines() {
    return (
        <Layout>
            <div className="px-4 md:px-0 max-w-2xl mx-auto py-8">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-pink-500/10 text-pink-500 rounded-2xl">
                        <BookOpen size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Community Guidelines</h1>
                        <p className="text-[var(--text-muted)] font-bold text-sm uppercase tracking-widest">Community Code of Conduct</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <p className="text-lg font-bold italic leading-relaxed opacity-90">
                        "Great communities require great responsibility. Share authentic stories, respect others, and build connections."
                    </p>

                    <div className="grid gap-4">
<GuidelineCard
                            icon={Heart}
                            title="Respectful Communication"
                            desc="We have zero tolerance for hate speech related to race, religion, sexual orientation, or gender. All content must be respectful and inclusive."
                            color="text-emerald-500"
                        />
                        <GuidelineCard
                            icon={UserX}
                            title="No Harassment or Bullying"
                            desc="Targeted bullying, doxing (sharing private info), or threats will result in immediate account suspension and permanent ban."
                            color="text-red-500"
                        />
                        <GuidelineCard
                            icon={AlertTriangle}
                            title="Family-Friendly Content Only"
                            desc="Graphic sexual content, extreme violence, or adult material is strictly prohibited. All content must be suitable for all ages."
                            color="text-amber-500"
                        />
                        <GuidelineCard
                            icon={CheckCircle}
                            title="Accurate Information"
                            desc="Don't share dangerous misinformation or harmful content. All posts should be truthful and constructive."
                            color="text-blue-500"
                        />
                        <GuidelineCard
                            icon={UserX}
                            title="Zero Harassment"
                            desc="Targeted bullying, doxing (sharing private info), or threats will result in a permanent ban of your alias."
                            color="text-red-500"
                        />
                        <GuidelineCard
                            icon={AlertTriangle}
                            title="Adult Content (NSFW)"
                            desc="Graphic sexual content or extreme violence is strictly prohibited. Keep the talk to gossip, not porn."
                            color="text-amber-500"
                        />
                        <GuidelineCard
                            icon={CheckCircle}
                            title="Verify Your Tea"
                            desc="Don't share dangerous misinformation that could cause physical harm. If it's fake, it's boring."
                            color="text-blue-500"
                        />
                    </div>

                    <div className="mt-12 bg-zinc-900 text-white p-8 rounded-[40px] shadow-2xl">
                        <h2 className="text-2xl font-black mb-4">How we enforce this:</h2>
                        <ul className="space-y-4 font-bold text-sm opacity-80">
                            <li className="flex items-start gap-3">
                                <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">1</span>
                                <span>AI-powered content filtering automatically blocks inappropriate content.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">2</span>
                                <span>Community reporting system (3 reports = automatic review, 5+ reports = temporary removal).</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">3</span>
                                <span>24/7 moderation team reviews flagged content and takes appropriate action.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">4</span>
                                <span>Verified users have higher trust scores and enhanced posting capabilities.</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8">
                    <AdUnit slot="GUIDELINES_PAGE_SLOT" />
                </div>
            </div>
        </Layout>
    );
}

function GuidelineCard({ icon: Icon, title, desc, color }: { icon: React.ElementType, title: string, desc: string, color: string }) {
    return (
        <div className="bg-[var(--card)] p-6 rounded-[32px] border border-[var(--border)] flex gap-5 items-center">
            <div className={`p-4 rounded-2xl bg-[var(--bg-secondary)] shadow-sm ${color}`}>
                <Icon size={24} />
            </div>
            <div>
                <h3 className="font-black text-lg mb-1">{title}</h3>
                <p className="text-[var(--text-muted)] text-sm font-medium leading-snug">{desc}</p>
            </div>
        </div>
    );
}
