import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    Image as ImageIcon,
    Video,
    Mic,
    Send,
    X,
    Lock,
    Globe
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';

export default function CreatePost() {
    const [content, setContent] = useState('');
    const [media, setMedia] = useState<string | null>(null);
    const [type, setType] = useState<'text' | 'image' | 'video' | 'audio'>('text');
    const [isAnonymous, setIsAnonymous] = useState(true);
    const [isPosting, setIsPosting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { addPost, showToast } = useApp();
    const { t } = useLanguage();
    const navigate = useNavigate();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setMedia(reader.result as string);
                if (file.type.startsWith('image/')) setType('image');
                else if (file.type.startsWith('video/')) setType('video');
                else if (file.type.startsWith('audio/')) setType('audio');
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePost = async () => {
        if (!content && !media) return;
        setIsPosting(true);
        try {
            await addPost({
                content: media || content,
                type: media ? type : 'text',
                timestamp: Date.now(),
                liked: false,
                disliked: false
            }, isAnonymous);
            showToast(t('create.success'));
            navigate('/');
        } catch (err) {
            showToast("Failed to post scoop", "error");
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <div className="bg-[var(--card)] border md:rounded-[32px] border-[var(--border)] overflow-hidden">
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display text-2xl font-black">{t('create.title')}</h2>
                    <div className="flex bg-[var(--bg-secondary)] p-1 rounded-xl">
                        <button
                            onClick={() => setIsAnonymous(true)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isAnonymous ? 'bg-white shadow-sm text-black' : 'text-[var(--text-muted)]'}`}
                        >
                            <Lock size={14} /> {t('create.anonymous')}
                        </button>
                        <button
                            onClick={() => setIsAnonymous(false)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${!isAnonymous ? 'bg-white shadow-sm text-black' : 'text-[var(--text-muted)]'}`}
                        >
                            <Globe size={14} /> {t('create.pseudo')}
                        </button>
                    </div>
                </div>

                <textarea
                    placeholder={t('create.placeholder')}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full bg-transparent text-xl font-medium outline-none resize-none min-h-[150px] placeholder:text-[var(--text-muted)] opacity-80 focus:opacity-100 transition-opacity"
                />

                {media && (
                    <div className="relative mt-4 rounded-2xl overflow-hidden border border-[var(--border)] group">
                        {type === 'image' && <img src={media} className="w-full h-auto max-h-[300px] object-cover" />}
                        {(type === 'video' || type === 'audio') && (
                            <div className="bg-black aspect-video flex items-center justify-center">
                                <Video className="text-white" size={48} />
                            </div>
                        )}
                        <button
                            onClick={() => setMedia(null)}
                            className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                )}

                <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*,audio/*" />
                        <MediaButton icon={ImageIcon} onClick={() => fileInputRef.current?.click()} color="text-pink-500" />
                        <MediaButton icon={Video} onClick={() => fileInputRef.current?.click()} color="text-purple-500" />
                        <MediaButton icon={Mic} onClick={() => fileInputRef.current?.click()} color="text-blue-500" />
                    </div>

                    <button
                        onClick={handlePost}
                        disabled={(!content && !media) || isPosting}
                        className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl font-black text-lg shadow-lg transition-all ${(!content && !media) || isPosting ? 'bg-[var(--border)] text-[var(--text-muted)]' : 'bg-[var(--brand)] text-white shadow-pink-500/20 active:scale-95'}`}
                    >
                        {isPosting ? t('create.posting') : <>{t('create.button')} <Send size={20} /></>}
                    </button>
                </div>
            </div>
        </div>
    );
}

function MediaButton({ icon: Icon, onClick, color }: { icon: any, onClick: () => void, color: string }) {
    return (
        <button
            onClick={onClick}
            className={`p-3 rounded-2xl hover:bg-[var(--bg-secondary)] transition-all ${color}`}
        >
            <Icon size={24} />
        </button>
    );
}
