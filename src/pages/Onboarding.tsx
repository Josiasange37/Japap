import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Check } from 'lucide-react';

export default function Onboarding() {
    const [step, setStep] = useState(0); // 0: Welcome, 1: Policy, 2: Profile
    const navigate = useNavigate();
    const [pseudo, setPseudo] = useState('');
    const [avatar, setAvatar] = useState<string | null>(null);

    const handleFinish = () => {
        localStorage.setItem('japap_onboarded', 'true');
        // Save user data to local storage/store
        localStorage.setItem('japap_user', JSON.stringify({ pseudo, avatar }));
        navigate('/');
    };

    const nextStep = () => setStep(s => s + 1);

    return (
        <div className="w-full h-screen bg-[#eff6ff] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-[-20%] right-[-20%] w-[600px] h-[600px] bg-purple-300/30 rounded-full blur-[100px] pointer-events-none mix-blend-multiply" />
            <div className="absolute bottom-[-20%] left-[-20%] w-[600px] h-[600px] bg-blue-300/30 rounded-full blur-[100px] pointer-events-none mix-blend-multiply" />

            <div className="w-full max-w-md bg-white/60 backdrop-blur-xl rounded-[40px] shadow-2xl overflow-hidden glass-panel relative min-h-[600px] flex flex-col">

                <div className="flex-1 relative">
                    <AnimatePresence mode="wait">
                        {step === 0 && (
                            <WelcomeStep key="step-0" onNext={nextStep} />
                        )}
                        {step === 1 && (
                            <PolicyStep key="step-1" onNext={nextStep} />
                        )}
                        {step === 2 && (
                            <ProfileStep
                                key="step-2"
                                pseudo={pseudo}
                                setPseudo={setPseudo}
                                avatar={avatar}
                                setAvatar={setAvatar}
                                onFinish={handleFinish}
                            />
                        )}
                    </AnimatePresence>
                </div>

                {/* Progress Indicator */}
                <div className="h-10 flex items-center justify-center gap-2 mb-6">
                    {[0, 1, 2].map(i => (
                        <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-black' : 'w-2 bg-black/20'}`} />
                    ))}
                </div>

            </div>
        </div>
    );
}

function WelcomeStep({ onNext }: { onNext: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col items-center justify-center h-full p-8 text-center"
        >
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                className="w-32 h-32 bg-black rounded-full mb-8 flex items-center justify-center"
            >
                <span className="text-white text-5xl">⚡️</span>
            </motion.div>

            <h1 className="font-display text-4xl font-black mb-4">Bienvenue sur Japap</h1>
            <p className="text-zinc-500 mb-12 text-lg leading-relaxed">
                Join the next generation social experience. Swipe, share, and vibe with your community.
            </p>

            <button onClick={onNext} className="w-full bg-black text-white py-4 rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
                Get Started <ChevronRight size={20} />
            </button>
        </motion.div>
    )
}

function PolicyStep({ onNext }: { onNext: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col h-full p-8"
        >
            <h2 className="font-display text-3xl font-bold mb-6 mt-4">Privacy & Rules</h2>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-6">
                <PolicyItem icon="🛡️" title="Data Privacy" desc="Your data is encrypted and we never share it with third parties." />
                <PolicyItem icon="🤝" title="Code of Conduct" desc="Be respectful. No hate speech, harassment, or nsfw content." />
                <PolicyItem icon="🕒" title="Pseudo Changes" desc="You can only change your username once every 2 weeks." />
            </div>

            <button onClick={onNext} className="w-full bg-zinc-900/5 text-black hover:bg-black hover:text-white py-4 rounded-2xl font-bold text-lg transition-colors flex items-center justify-center gap-2 mb-4">
                I Agree & Continue
            </button>
        </motion.div>
    )
}

function PolicyItem({ icon, title, desc }: { icon: string, title: string, desc: string }) {
    return (
        <div className="bg-white/50 p-4 rounded-2xl border border-white/50">
            <div className="text-2xl mb-2">{icon}</div>
            <h3 className="font-bold text-lg">{title}</h3>
            <p className="text-zinc-500 text-sm">{desc}</p>
        </div>
    )
}

function ProfileStep({ pseudo, setPseudo, avatar, setAvatar, onFinish }: {
    pseudo: string, setPseudo: (s: string) => void,
    avatar: string | null, setAvatar: (s: string | null) => void,
    onFinish: () => void
}) {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const isValid = pseudo.length >= 3;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col h-full p-8 items-center"
        >
            <h2 className="font-display text-3xl font-bold mb-2 mt-4">Set up Profile</h2>
            <p className="text-zinc-500 mb-8 text-center">How should we call you?</p>

            <div className="relative mb-8 group cursor-pointer">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-zinc-100 ring-4 ring-white shadow-xl flex items-center justify-center">
                    {avatar ? (
                        <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-4xl opacity-20">👤</span>
                    )}
                </div>
                <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                <div className="absolute bottom-0 right-0 bg-black text-white p-2 rounded-full shadow-lg">
                    <span className="text-xs font-bold">EDIT</span>
                </div>
            </div>

            <div className="w-full space-y-2 mb-auto">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 ml-4">Pseudonym</label>
                <input
                    type="text"
                    value={pseudo}
                    onChange={(e) => setPseudo(e.target.value)}
                    placeholder="@username"
                    className="w-full bg-white p-4 rounded-2xl font-bold text-lg outline-none ring-1 ring-zinc-200 focus:ring-2 focus:ring-black transition-all"
                />
                <p className="text-xs text-zinc-400 ml-4">Min. 3 characters. Unique.</p>
            </div>

            <button
                onClick={onFinish}
                disabled={!isValid}
                className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${isValid ? 'bg-black text-white hover:scale-[1.02]' : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'}`}
            >
                Complete Setup <Check size={20} />
            </button>
        </motion.div>
    )
}
