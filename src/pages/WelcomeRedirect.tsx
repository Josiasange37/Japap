import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, User, Lock, Mail, ArrowRight } from 'lucide-react';

export default function WelcomeRedirect() {
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect after 3 seconds
        const timer = setTimeout(() => {
            navigate('/onboarding');
        }, 3000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full"
            >
                {/* Logo and Welcome Message */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-[var(--brand)] rounded-2xl mx-auto mb-6 flex items-center justify-center">
                        <UserPlus className="text-white" size={32} />
                    </div>
                    
                    <h1 className="text-3xl font-black mb-4">Welcome to Japap!</h1>
                    <p className="text-[var(--text-muted)] mb-6 text-lg">
                        It looks like you're new here. Let's get you set up with a quick account creation.
                    </p>
                </div>

                {/* Key Features */}
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 mb-6">
                    <h2 className="text-xl font-black mb-4">Get Started in 3 Steps</h2>
                    
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="text-blue-500" size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold">Create Your Profile</h3>
                                <p className="text-[var(--text-muted)] text-sm">Choose your username and avatar</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <Lock className="text-green-500" size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold">Privacy First</h3>
                                <p className="text-[var(--text-muted)] text-sm">Your identity is protected and anonymous-friendly</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                <Mail className="text-purple-500" size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold">Share Stories</h3>
                                <p className="text-[var(--text-muted)] text-sm">Connect with your community safely</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Call to Action */}
                <div className="text-center">
                    <motion.button
                        onClick={() => navigate('/onboarding')}
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-[var(--brand)] text-white px-8 py-4 rounded-2xl font-black text-lg shadow-lg shadow-[var(--brand)]/20 transition-all flex items-center gap-3 group"
                    >
                        Get Started Now
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                    
                    <p className="text-[var(--text-muted)] text-sm mt-4">
                        Redirecting automatically in 3 seconds...
                    </p>
                </div>
            </motion.div>
        </div>
    );
}