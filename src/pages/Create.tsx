import { useState, useRef } from 'react';
import { Image as ImageIcon, Mic, Video, Type, ChevronLeft, Smile, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ReactionPicker from '../components/ReactionPicker';
import type { MediaType } from '../types';

const LIMITS = {
    IMAGE_SIZE: 5 * 1024 * 1024,
    VIDEO_SIZE: 20 * 1024 * 1024,
    AUDIO_SIZE: 10 * 1024 * 1024,
    VIDEO_DURATION: 60,
    AUDIO_DURATION: 300,
};

export default function Create() {
    const navigate = useNavigate();
    const { addPost, showToast } = useApp();
    const [selectedType, setSelectedType] = useState<MediaType | null>(null);
    const [content, setContent] = useState('');
    const [caption, setCaption] = useState('');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Audio specific mock fields
    const [audioTitle, setAudioTitle] = useState('');
    const [audioArtist, setAudioArtist] = useState('');

    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = document.createElement('img');
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1080;
                    const MAX_HEIGHT = 1920;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.7));
                };
            };
        });
    };

    const getDuration = (file: File, type: 'video' | 'audio'): Promise<number> => {
        return new Promise((resolve) => {
            const media = document.createElement(type);
            media.src = URL.createObjectURL(file);
            media.onloadedmetadata = () => {
                URL.revokeObjectURL(media.src);
                resolve(media.duration);
            };
        });
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedType) return;

        // Size Validation
        if (selectedType === 'image' && file.size > LIMITS.IMAGE_SIZE) {
            showToast('Image too large! Max 5MB.', 'error');
            return;
        }
        if (selectedType === 'video' && file.size > LIMITS.VIDEO_SIZE) {
            showToast('Video too large! Max 20MB.', 'error');
            return;
        }
        if (selectedType === 'audio' && file.size > LIMITS.AUDIO_SIZE) {
            showToast('Audio too large! Max 10MB.', 'error');
            return;
        }

        setIsProcessing(true);

        try {
            if (selectedType === 'image') {
                const compressed = await compressImage(file);
                setContent(compressed);
                setPreviewUrl(compressed);
            } else if (selectedType === 'video') {
                const duration = await getDuration(file, 'video');
                if (duration > LIMITS.VIDEO_DURATION) {
                    showToast('Video too long! Max 60 seconds.', 'error');
                    setIsProcessing(false);
                    return;
                }
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onloadend = () => {
                    setContent(reader.result as string);
                    setPreviewUrl(reader.result as string);
                    setIsProcessing(false);
                };
            } else if (selectedType === 'audio') {
                const duration = await getDuration(file, 'audio');
                if (duration > LIMITS.AUDIO_DURATION) {
                    showToast('Audio too long! Max 5 minutes.', 'error');
                    setIsProcessing(false);
                    return;
                }
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onloadend = () => {
                    setContent(reader.result as string);
                    setPreviewUrl(reader.result as string);
                    setIsProcessing(false);
                };
            }
        } catch (err) {
            showToast('Failed to process file', 'error');
            console.error(err);
        } finally {
            if (selectedType === 'image') setIsProcessing(false);
        }
    };

    const handleShare = () => {
        if (!selectedType) return;

        addPost({
            type: selectedType,
            content: content,
            caption: caption,
            title: audioTitle || 'Unknown Track',
            artist: audioArtist || 'Unknown Artist',
            bgGradient: selectedType === 'image' ? undefined : '#e0f2fe'
        });

        navigate('/');
    };

    if (selectedType) {
        return (
            <div className="w-full h-full flex flex-col p-6 animate-in slide-in-from-right duration-300">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => setSelectedType(null)} className="p-2 -ml-2 hover:bg-zinc-100 rounded-full">
                        <ChevronLeft size={24} />
                    </button>
                    <h2 className="font-display text-2xl font-bold capitalize">New {selectedType}</h2>
                </div>

                <div className="flex-1 flex flex-col gap-6">
                    {selectedType === 'text' && (
                        <textarea
                            placeholder="What's on your mind?"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full h-40 bg-zinc-50 p-4 rounded-2xl resize-none text-xl outline-none focus:ring-2 focus:ring-black/5"
                            autoFocus
                        />
                    )}

                    {(selectedType === 'image' || selectedType === 'video') && (
                        <div className="space-y-4">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                accept={selectedType === 'image' ? 'image/*' : 'video/*'}
                                className="hidden"
                            />
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="aspect-[4/5] bg-zinc-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-zinc-200 cursor-pointer hover:bg-zinc-50 transition-colors overflow-hidden"
                            >
                                {previewUrl ? (
                                    selectedType === 'image' ? (
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <video src={previewUrl} className="w-full h-full object-cover" controls />
                                    )
                                ) : (
                                    <div className="text-center text-zinc-400">
                                        <span className="block text-4xl mb-2">📸</span>
                                        <span className="font-bold">Tap to upload {selectedType}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {selectedType === 'audio' && (
                        <div className="space-y-4">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                accept="audio/*"
                                className="hidden"
                            />
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full h-32 bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
                            >
                                <Mic size={40} className={previewUrl ? "text-green-500" : "text-purple-500"} />
                                {previewUrl && <span className="ml-2 font-bold text-purple-600">Audio Loaded!</span>}
                            </div>
                            <input
                                type="text"
                                placeholder="Song Title"
                                value={audioTitle}
                                onChange={(e) => setAudioTitle(e.target.value)}
                                className="w-full bg-zinc-50 p-4 rounded-xl outline-none font-bold"
                            />
                            <input
                                type="text"
                                placeholder="Artist Name"
                                value={audioArtist}
                                onChange={(e) => setAudioArtist(e.target.value)}
                                className="w-full bg-zinc-50 p-4 rounded-xl outline-none"
                            />
                        </div>
                    )}

                    {selectedType !== 'text' && (
                        <div className="relative">
                            <textarea
                                placeholder="Add a caption..."
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                className="w-full h-24 bg-zinc-50 p-4 pr-12 rounded-2xl resize-none outline-none focus:ring-2 focus:ring-black/5"
                            />
                            <button
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                className="absolute top-4 right-4 p-1 hover:bg-zinc-200 rounded-full transition-colors"
                            >
                                <Smile size={20} className="text-zinc-400" />
                            </button>
                            <ReactionPicker
                                visible={showEmojiPicker}
                                onSelect={(emoji) => {
                                    setCaption(prev => prev + emoji);
                                    setShowEmojiPicker(false);
                                }}
                                onClose={() => setShowEmojiPicker(false)}
                                position="relative"
                            />
                        </div>
                    )}
                </div>

                <button
                    onClick={handleShare}
                    disabled={isProcessing || (selectedType === 'text' && !content) || (selectedType !== 'text' && !content)}
                    className="w-full py-4 bg-black text-white rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mb-20 shadow-xl shadow-black/10 flex items-center justify-center gap-2"
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            Processing...
                        </>
                    ) : 'Post It'}
                </button>
            </div>
        )
    }

    return (
        <div className="w-full h-full flex flex-col p-6">
            <h1 className="font-display text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 mb-8">
                Create
            </h1>

            <div className="grid grid-cols-2 gap-4">
                <CreateOption icon={ImageIcon} label="Image" color="bg-blue-100 text-blue-600" onClick={() => setSelectedType('image')} />
                <CreateOption icon={Video} label="Video" color="bg-purple-100 text-purple-600" onClick={() => setSelectedType('video')} />
                <CreateOption icon={Mic} label="Audio" color="bg-red-100 text-red-600" onClick={() => setSelectedType('audio')} />
                <CreateOption icon={Type} label="Text" color="bg-orange-100 text-orange-600" onClick={() => setSelectedType('text')} />
            </div>

            <div className="mt-8 p-6 rounded-[30px] bg-white border border-zinc-100 shadow-xl shadow-zinc-200/50 flex flex-col items-center justify-center text-center flex-1 mb-20">
                <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
                    <span className="text-4xl grayscale">✨</span>
                </div>
                <h3 className="font-bold text-lg text-zinc-900">Share your vibe</h3>
                <p className="text-zinc-400 text-sm mt-2 max-w-[200px]">Select a media type above to start creating your next masterpiece.</p>
            </div>
        </div>
    );
}

function CreateOption({ icon: Icon, label, color, onClick }: { icon: any, label: string, color: string, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`aspect-square rounded-[30px] ${color} flex flex-col items-center justify-center gap-3 transition-transform hover:scale-[1.02] active:scale-95`}
        >
            <Icon size={32} strokeWidth={2.5} />
            <span className="font-bold text-sm tracking-wide">{label}</span>
        </button>
    )
}
