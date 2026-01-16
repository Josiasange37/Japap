import React, { createContext, useContext, useState, useEffect } from 'react';
import { useApp } from './AppContext';

export type VerificationLevel = 'unverified' | 'basic' | 'verified' | 'premium';

export interface UserProfile {
  id?: string;
  pseudo: string;
  avatar?: string;
  bio?: string;
  verificationLevel: VerificationLevel;
  verificationBadge?: string;
  joinedAt: number;
  lastActive: number;
  stats: {
    postsCount: number;
    reputation: number;
    helpfulFlags: number;
    communityContribution: number;
  };
}

interface VerificationContextType {
  verificationLevel: VerificationLevel;
  profile: UserProfile | null;
  requestVerification: (level: VerificationLevel) => Promise<boolean>;
  updateProfile: (data: Partial<UserProfile>) => void;
  isVerified: boolean;
  canPostAnonymously: boolean;
}

const VerificationContext = createContext<VerificationContextType | undefined>(undefined);

export function VerificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useApp();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [verificationLevel, setVerificationLevel] = useState<VerificationLevel>('unverified');

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    // In a real app, this would load from your backend
    const mockProfile: UserProfile = {
      pseudo: user?.pseudo || '',
      avatar: user?.avatar || undefined,
      bio: user?.bio || undefined,
      verificationLevel: 'basic',
      verificationBadge: 'Basic',
      joinedAt: Date.now() - (30 * 24 * 60 * 60 * 1000), // 30 days ago
      lastActive: Date.now(),
      stats: {
        postsCount: 5,
        reputation: 75,
        helpfulFlags: 2,
        communityContribution: 3
      }
    };

    setProfile(mockProfile);
    setVerificationLevel(mockProfile.verificationLevel);
  };

  const requestVerification = async (level: VerificationLevel): Promise<boolean> => {
    try {
      // Simulate verification process
      let success = false;

      switch (level) {
        case 'basic':
          // Email verification or similar
          success = true;
          break;
        case 'verified':
          // Phone verification or ID check
          success = await simulateVerificationProcess('verified');
          break;
        case 'premium':
          // Paid verification or advanced verification
          success = await simulateVerificationProcess('premium');
          break;
      }

      if (success && profile) {
        const updatedProfile = {
          ...profile,
          verificationLevel: level,
          verificationBadge: getBadgeText(level)
        };
        setProfile(updatedProfile);
        setVerificationLevel(level);
      }

      return success;
    } catch (error) {
      console.error('Verification failed:', error);
      return false;
    }
  };

  const simulateVerificationProcess = async (type: VerificationLevel): Promise<boolean> => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(Math.random() > 0.3); // 70% success rate
      }, 2000);
    });
  };

  const getBadgeText = (level: VerificationLevel): string => {
    switch (level) {
      case 'basic': return 'Basic';
      case 'verified': return 'Verified';
      case 'premium': return 'Premium';
      default: return '';
    }
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    if (profile) {
      setProfile({ ...profile, ...data });
    }
  };

  const isVerified = verificationLevel !== 'unverified';
  const canPostAnonymously = verificationLevel === 'verified' || verificationLevel === 'premium';

  return (
    <VerificationContext.Provider
      value={{
        verificationLevel,
        profile,
        requestVerification,
        updateProfile,
        isVerified,
        canPostAnonymously
      }}
    >
      {children}
    </VerificationContext.Provider>
  );
}

export function useVerification() {
  const context = useContext(VerificationContext);
  if (context === undefined) {
    throw new Error('useVerification must be used within a VerificationProvider');
  }
  return context;
}

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