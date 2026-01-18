import React, { createContext, useContext, useState, useEffect } from 'react';
import type { VerificationLevel, UserProfile } from '../types';
import { useApp } from './AppContext';

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

  const getMockProfile = (currentUser: UserProfile | null): UserProfile => {
    return {
      pseudo: currentUser?.pseudo || '',
      avatar: currentUser?.avatar || null,
      bio: currentUser?.bio || '',
      onboarded: true,
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
  };

  useEffect(() => {
    let mounted = true;
    if (user) {
      // Use timeout to avoid synchronous state update warning during effect
      const timer = setTimeout(() => {
        if (!mounted) return;
        const mock = getMockProfile(user);
        setProfile(mock);
        setVerificationLevel(mock.verificationLevel || 'unverified');
      }, 0);
      return () => {
        mounted = false;
        clearTimeout(timer);
      };
    }
    return () => { mounted = false; };
  }, [user]);


  const simulateVerificationProcess = async (): Promise<boolean> => {
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
          success = await simulateVerificationProcess();
          break;
        case 'premium':
          // Paid verification or advanced verification
          success = await simulateVerificationProcess();
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

// eslint-disable-next-line react-refresh/only-export-components
export function useVerification() {
  const context = useContext(VerificationContext);
  if (context === undefined) {
    throw new Error('useVerification must be used within a VerificationProvider');
  }
  return context;
}
