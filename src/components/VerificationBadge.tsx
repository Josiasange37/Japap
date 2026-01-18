
import type { VerificationLevel } from '../types';

export const VerificationBadge = ({ level, className = '' }: { level: VerificationLevel; className?: string }) => {
    const getBadgeConfig = () => {
        switch (level) {
            case 'basic':
                return {
                    color: 'bg-blue-500',
                    text: 'Basic',
                    icon: '✓'
                };
            case 'verified':
                return {
                    color: 'bg-emerald-500',
                    text: 'Verified',
                    icon: '✓✓'
                };
            case 'premium':
                return {
                    color: 'bg-purple-500',
                    text: 'Premium',
                    icon: '⭐'
                };
            default:
                return null;
        }
    };

    const config = getBadgeConfig();
    if (!config) return null;

    return (
        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-white text-xs font-black ${config.color} ${className}`}>
            <span>{config.icon}</span>
            <span>{config.text}</span>
        </div>
    );
};
