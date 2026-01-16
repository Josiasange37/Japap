import React from 'react';
import {
    ChevronLeft,
    Lock,
    TrendingUp,
    Zap,
    Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import CreatePost from '../components/CreatePost';
import AdUnit from '../components/AdUnit';
import { useLanguage } from '../context/LanguageContext';

export default function Create() {
    const navigate = useNavigate();
    const { t } = useLanguage();

    return (
        <Layout>
            <div className="px-4 md:px-0">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate(-1)} className="p-3 bg-[var(--bg-secondary)] rounded-2xl hover:scale-110 transition-transform">
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="font-display text-4xl font-black tracking-tight">{t('create.page.title')}</h1>
                        <p className="text-[var(--text-muted)] font-bold text-xs uppercase tracking-[0.2em] mt-1">{t('create.page.subtitle')}</p>
                    </div>
                </div>

                <div className="max-w-xl mx-auto space-y-6">
                    <CreatePost />

                    {/* Gossip Rules / Tips */}
                    <div className="bg-[var(--card)] border border-[var(--border)] p-6 rounded-[32px] space-y-4">
                        <div className="flex items-center gap-3 text-[var(--brand)]">
                            <Info size={20} />
                            <h3 className="font-black text-sm uppercase tracking-widest">{t('create.page.guidelines')}</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <TipItem icon={Lock} title={t('create.page.tip1.title')} desc={t('create.page.tip1.desc')} />
                            <TipItem icon={TrendingUp} title={t('create.page.tip2.title')} desc={t('create.page.tip2.desc')} />
                            <TipItem icon={Zap} title={t('create.page.tip3.title')} desc={t('create.page.tip3.desc')} />
                            <TipItem icon="🍿" title={t('create.page.tip4.title')} desc={t('create.page.tip4.desc')} />
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <AdUnit slot="CREATE_PAGE_SLOT" />
                </div>
            </div>
        </Layout>
    );
}

function TipItem({ icon: Icon, title, desc }: { icon: React.ElementType | string, title: string, desc: string }) {
    return (
        <div className="bg-[var(--bg-secondary)] p-4 rounded-2xl border border-[var(--border)]">
            <div className="flex items-center gap-2 mb-1">
                {typeof Icon === 'string' ? <span className="text-sm">{Icon}</span> : <Icon size={14} className="text-[var(--brand)]" />}
                <span className="font-black text-[10px] uppercase tracking-wider">{title}</span>
            </div>
            <p className="text-[11px] font-bold text-[var(--text-muted)] leading-tight">{desc}</p>
        </div>
    );
}
