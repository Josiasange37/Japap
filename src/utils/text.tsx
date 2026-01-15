import React from 'react';

export const parseTextWithHashtags = (text: string) => {
    if (!text) return null;

    // Split by spaces or newlines but keep delimiters to preserve formatting
    const parts = text.split(/(\s+)/);

    return parts.map((part, index) => {
        if (part.startsWith('#') && part.length > 1) {
            return (
                <span key={index} className="text-[var(--brand)] font-bold cursor-pointer hover:underline">
                    {part}
                </span>
            );
        }
        return part;
    });
};
