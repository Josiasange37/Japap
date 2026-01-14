import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Check, Shield, Users, Timer, Zap, Camera } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';

export default function Onboarding() {
    const [step, setStep] = useState(0);
    const navigate = useNavigate();
    const [pseudo, setPseudo] = useState('');
    const [avatar, setAvatar] = useState<string | null>(null);

    const { updateUser } = useApp();
    const { language, setLanguage, t } = useLanguage();
    const [isLoading, setIsLoading] = useState(false);

    const handleFinish = async () => {
        setIsLoading(true);
        try {
            await updateUser({
                pseudo,
                avatar,
                onboarded: true,
                bio: "Spilling tea since forever"
            });
            navigate('/', { replace: true });
        } catch (error) {
            console.error("Failed to finish onboarding:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const nextStep = () => setStep(s => s + 1);

    return (
        <div className="w-full h-screen bg-[var(--bg)] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Language Selector In Onboarding */}
            <div className="absolute top-8 right-8 z-[100] flex bg-[var(--card)] p-1 rounded-2xl border border-[var(--border)] shadow-xl">
                <button
                    onClick={() => setLanguage('fr')}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${language === 'fr' ? 'bg-black text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-800'}`}
                >
                    FR
                </button>
                <button
                    onClick={() => setLanguage('en')}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${language === 'en' ? 'bg-black text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-800'}`}
                >
                    EN
                </button>
            </div>

            {/* Background Blob Elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[var(--brand)] opacity-10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500 opacity-10 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-lg bg-[var(--card)] border border-[var(--border)] rounded-[48px] shadow-2xl overflow-hidden relative min-h-[650px] flex flex-col">
                <div className="flex-1 relative">
                    <AnimatePresence mode="wait">
                        {step === 0 && <WelcomeStep key="step-0" onNext={nextStep} t={t} />}
                        {step === 1 && <PolicyStep key="step-1" onNext={nextStep} t={t} />}
                        {step === 2 && (
                            <ProfileStep
                                key="step-2"
                                pseudo={pseudo}
                                setPseudo={setPseudo}
                                avatar={avatar}
                                setAvatar={setAvatar}
                                onFinish={handleFinish}
                                isLoading={isLoading}
                                t={t}
                            />
                        )}
                    </AnimatePresence>
                </div>

                {/* Progress Dots */}
                <div className="h-20 flex items-center justify-center gap-3">
                    {[0, 1, 2].map(i => (
                        <div key={i} className={`h-2.5 rounded-full transition-all duration-500 ${i === step ? 'w-10 bg-[var(--brand)]' : 'w-2.5 bg-[var(--border)]'}`} />
                    ))}
                </div>
            </div>
        </div>
    );
}

function WelcomeStep({ onNext, t }: { onNext: () => void, t: any }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center h-full p-12 text-center"
        >
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12, delay: 0.2 }}
                className="w-40 h-40 bg-[var(--brand)] rounded-[40px] mb-10 flex items-center justify-center shadow-2xl shadow-pink-500/40 rotate-12"
            >
                <Zap className="text-white fill-white" size={64} />
            </motion.div>

            <h1 className="font-display text-5xl font-black mb-6 tracking-tight leading-tight">
                {t('onboarding.welcome.title')} <br /><span className="italic text-[var(--brand)]">JAPAP</span>
            </h1>
            <p className="text-[var(--text-muted)] mb-12 text-lg font-bold leading-relaxed max-w-sm">
                {t('onboarding.welcome.desc')}
            </p>

            <button onClick={onNext} className="w-full bg-black text-white py-5 rounded-[24px] font-black text-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl uppercase tracking-tighter">
                {t('onboarding.welcome.button')} <ChevronRight size={24} />
            </button>
        </motion.div>
    )
}

function PolicyStep({ onNext, t }: { onNext: () => void, t: any }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex flex-col h-full p-12"
        >
            <h2 className="font-display text-4xl font-black mb-8 mt-4 leading-tight uppercase tracking-tighter">
                {t('onboarding.policy.title')}<br /><span className="text-[var(--brand)] italic">{t('onboarding.policy.subtitle')}</span>
            </h2>

            <div className="flex-1 space-y-5 mb-8 overflow-y-auto no-scrollbar">
                <PolicyItem icon={Shield} title={t('onboarding.policy.1.title')} desc={t('onboarding.policy.1.desc')} color="text-emerald-500" />
                <PolicyItem icon={Users} title={t('onboarding.policy.2.title')} desc={t('onboarding.policy.2.desc')} color="text-blue-500" />
                <PolicyItem icon={Timer} title={t('onboarding.policy.3.title')} desc={t('onboarding.policy.3.desc')} color="text-amber-500" />
            </div>

            <button onClick={onNext} className="w-full bg-[var(--brand)] text-white py-5 rounded-[24px] font-black text-lg shadow-xl shadow-pink-500/20 active:scale-95 transition-all uppercase tracking-tighter">
                {t('onboarding.policy.button')}
            </button>
        </motion.div>
    )
}

function PolicyItem({ icon: Icon, title, desc, color }: { icon: any, title: string, desc: string, color: string }) {
    return (
        <div className="bg-[var(--bg-secondary)] p-5 rounded-[28px] border border-[var(--border)] flex gap-4 items-center">
            <div className={`p-3 rounded-2xl bg-white shadow-sm ${color}`}>
                <Icon size={24} />
            </div>
            <div>
                <h3 className="font-black text-sm uppercase tracking-wider mb-0.5">{title}</h3>
                <p className="text-[var(--text-muted)] text-[13px] font-bold leading-snug">{desc}</p>
            </div>
        </div>
    )
}

function ProfileStep({ pseudo, setPseudo, avatar, setAvatar, onFinish, isLoading, t }: {
    pseudo: string, setPseudo: (s: string) => void,
    avatar: string | null, setAvatar: (s: string | null) => void,
    onFinish: () => void,
    isLoading: boolean,
    t: any
}) {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setAvatar(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const isValid = pseudo.length >= 3;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col h-full p-12 items-center"
        >
            <h2 className="font-display text-4xl font-black mb-10 mt-4 leading-tight uppercase tracking-tighter">
                {t('onboarding.profile.title')}<br /><span className="text-[var(--brand)] italic">{t('onboarding.profile.subtitle')}</span>
            </h2>

            <div className="relative mb-12 group cursor-pointer">
                <div className="w-36 h-36 rounded-full overflow-hidden bg-[var(--bg-secondary)] ring-8 ring-[var(--bg-secondary)] shadow-2xl flex items-center justify-center">
                    {avatar ? (
                        <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-5xl">👤</span>
                    )}
                </div>
                <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                <div className="absolute bottom-0 right-0 bg-black text-white p-3 rounded-full shadow-lg">
                    <Camera size={18} />
                </div>
            </div>

            <div className="w-full space-y-2 mb-auto">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] ml-6">{t('onboarding.profile.label')}</label>
                <input
                    type="text"
                    value={pseudo}
                    onChange={(e) => setPseudo(e.target.value)}
                    placeholder="@tea_master"
                    className="w-full bg-[var(--bg-secondary)] p-6 rounded-[28px] font-black text-xl outline-none border-2 border-transparent focus:border-[var(--brand)] transition-all"
                />
            </div>

            <button
                onClick={onFinish}
                disabled={!isValid || isLoading}
                className={`w-full py-5 rounded-[24px] font-black text-lg flex items-center justify-center gap-3 transition-all uppercase tracking-tighter ${isValid && !isLoading ? 'bg-black text-white shadow-xl hover:scale-[1.02]' : 'bg-[var(--border)] text-[var(--text-muted)] cursor-not-allowed'}`}
            >
                {isLoading ? (
                    <div className="w-7 h-7 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                    <>{t('onboarding.profile.button')} <Check size={24} /></>
                )}
            </button>
        </motion.div>
    )
}
