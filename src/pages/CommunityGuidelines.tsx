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
                        <p className="text-[var(--text-muted)] font-bold text-sm uppercase tracking-widest">The Gossip Code of Conduct</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <p className="text-lg font-bold italic leading-relaxed opacity-90">
                        "Great gossip requires great responsibility. Keep it juicy, but keep it human."
                    </p>

                    <div className="grid gap-4">
                        <GuidelineCard
                            icon={Heart}
                            title="No Hate Speech"
                            desc="We have zero tolerance for hate speech related to race, religion, sexual orientation, or gender. Toxicity is not tea."
                            color="text-emerald-500"
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
                                <span>AI-powered keyword filtering to blur toxic content.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">2</span>
                                <span>Community reporting (Any post reported 5 times is auto-hidden).</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">3</span>
                                <span>Manual review by our shadow moderators.</span>
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
