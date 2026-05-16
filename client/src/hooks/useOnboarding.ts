/**
 * useOnboarding Hook
 * 
 * Determines if a user needs to complete onboarding flow.
 * 
 * Rules:
 * - Check backend onboardingCompleted flag from user object
 * - Show onboarding if:
 *   - User is authenticated AND
 *   - User object has onboardingCompleted = false OR onboardingCompleted is missing
 * - Hide onboarding if:
 *   - User is not authenticated OR
 *   - User object has onboardingCompleted = true OR
 *   - User has region field saved (indicates onboarding was completed)
 */

import { useEffect, useState } from 'react';

interface OnboardingStatus {
  needsOnboarding: boolean;
  isLoading: boolean;
}

/**
 * Check if user needs onboarding based on backend flag
 * @param userId - Current user's ID
 * @param isAuthenticated - Whether user is authenticated
 * @returns OnboardingStatus object
 */
export const useOnboarding = (userId: string | null, isAuthenticated: boolean): OnboardingStatus => {
  const [status, setStatus] = useState<OnboardingStatus>({
    needsOnboarding: false,
    isLoading: true,
  });

  useEffect(() => {
    const checkOnboardingStatus = () => {
      // Not authenticated - no onboarding needed
      if (!isAuthenticated || !userId) {
        setStatus({
          needsOnboarding: false,
          isLoading: false,
        });
        return;
      }

      // Check user object from localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          
          // If user has region field saved, onboarding was completed
          if (user.region) {
            setStatus({
              needsOnboarding: false,
              isLoading: false,
            });
            return;
          }
          
          // Check onboardingCompleted flag from backend
          // Show onboarding if flag is false or missing
          const onboardingCompleted = user.onboardingCompleted === true;
          
          setStatus({
            needsOnboarding: !onboardingCompleted,
            isLoading: false,
          });
          return;
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }

      // Default: no onboarding needed
      setStatus({
        needsOnboarding: false,
        isLoading: false,
      });
    };

    checkOnboardingStatus();
  }, [userId, isAuthenticated]);

  return status;
};

/**
 * Mark user as new (call this after successful signup)
 * Kept for backward compatibility
 * @param userId - User's ID
 */
export const markUserAsNew = (userId: string) => {
  localStorage.setItem(`user_created_at_${userId}`, new Date().toISOString());
};

/**
 * Mark onboarding as completed
 * Kept for backward compatibility
 * @param userId - User's ID
 */
export const markOnboardingComplete = (userId: string) => {
  localStorage.setItem(`onboarding_${userId}`, JSON.stringify({
    completedAt: new Date().toISOString(),
  }));
};

