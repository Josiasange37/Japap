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
    const [mediaProgress, setMediaProgress] = useState<number | null>(null);
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [type, setType] = useState<'text' | 'image' | 'video' | 'audio'>('text');
    const [isAnonymous, setIsAnonymous] = useState(true);
    const [isPosting, setIsPosting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { addPost, showToast, uploadFile } = useApp();
    const { t } = useLanguage();
    const navigate = useNavigate();

    const LIMITS = {
        image: 5 * 1024 * 1024, // 5MB
        video: 25 * 1024 * 1024, // 25MB
        audio: 15 * 1024 * 1024, // 15MB
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            let fileType: 'image' | 'video' | 'audio' | null = null;
            if (file.type.startsWith('image/')) fileType = 'image';
            else if (file.type.startsWith('video/')) fileType = 'video';
            else if (file.type.startsWith('audio/')) fileType = 'audio';

            if (!fileType) {
                showToast("Unsupported file type", "error");
                return;
            }

            if (file.size > LIMITS[fileType]) {
                const limitMb = LIMITS[fileType] / (1024 * 1024);
                showToast(`File too large. Max size for ${fileType} is ${limitMb}MB`, "error");
                return;
            }

            setMediaFile(file);
            setType(fileType);

            const reader = new FileReader();
            reader.onloadend = () => {
                setMediaPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePost = async () => {
        if (!content && !mediaPreview) return;
        setIsPosting(true);
        try {
            let finalContent = content;
            let finalCaption = undefined;

            if (mediaFile) {
                showToast("Uploading media...", "info");
                finalContent = await uploadFile(mediaFile, type);
                finalCaption = content;
            }

            await addPost({
                content: finalContent,
                caption: finalCaption,
                type: mediaFile ? type : 'text',
                timestamp: Date.now(),
                liked: false,
                disliked: false
            }, isAnonymous);

            showToast(t('create.success'));
            navigate('/');
        } catch (err) {
            console.error(err);
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

                {mediaPreview && (
                    <div className="relative mt-4 rounded-2xl overflow-hidden border border-[var(--border)] group">
                        {type === 'image' && <img src={mediaPreview} className="w-full h-auto max-h-[300px] object-cover" />}
                        {type === 'video' && (
                            <video src={mediaPreview} className="w-full max-h-[300px] object-cover" controls />
                        )}
                        {type === 'audio' && (
                            <div className="bg-zinc-900 p-8 flex flex-col items-center justify-center gap-4">
                                <Mic className="text-[var(--brand)] animate-pulse" size={48} />
                                <p className="text-sm font-bold text-zinc-400">{mediaFile?.name}</p>
                                <audio src={mediaPreview} controls className="w-full h-8" />
                            </div>
                        )}
                        <button
                            onClick={() => {
                                setMediaPreview(null);
                                setMediaFile(null);
                            }}
                            className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black transition-colors z-10"
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
                        disabled={(!content && !mediaPreview) || isPosting}
                        className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl font-black text-lg shadow-lg transition-all ${(!content && !mediaPreview) || isPosting ? 'bg-[var(--border)] text-[var(--text-muted)]' : 'bg-[var(--brand)] text-white shadow-pink-500/20 active:scale-95'}`}
                    >
                        {isPosting ? "Posting..." : <>{t('create.button')} <Send size={20} /></>}
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
