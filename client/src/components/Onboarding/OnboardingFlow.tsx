/**
 * Enhanced OnboardingFlow Component
 * 
 * Handles post-login onboarding for newly registered Google/Gmail users.
 * Flow:
 * 1. Request location permission (geolocation API)
 * 2. Show user details form (Full Name, Phone, Age, Food Preference)
 * 3. If location allowed: reverse geocode to get region
 * 4. If location denied: set region to "India"
 * 5. Save all data to Users model
 * 6. Redirect to dashboard
 */

import React, { useState, useEffect } from 'react';
import { MapPin, AlertCircle, CheckCircle, Loader, Phone } from 'lucide-react';
import apiClient from '../../apiCall/api';
import { getCurrentSeason } from '../../utils/ayurvedic-logic';
import { useAuth } from '../../contexts/AuthContext';

interface OnboardingFlowProps {
  userId: string;
  onComplete: () => void;
}

type OnboardingStep = 'location-permission' | 'user-details' | 'completed';

interface LocationData {
  latitude: number;
  longitude: number;
  region?: string;
}

interface FormData {
  fullName: string;
  phoneNumber: string;
  birthdate: string;
}

interface FormErrors {
  fullName?: string;
  phoneNumber?: string;
  birthdate?: string;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ userId, onComplete }) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('location-permission');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const { updateUser } = useAuth();

  // User details form state
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    phoneNumber: '',
    birthdate: '',
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  /**
   * Calculate age from birthdate
   */
  const calculateAge = (birthdate: string): number => {
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  /**
   * Request browser/device location permission
   * Uses Geolocation API to get user's coordinates
   */
  const requestLocationPermission = async () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      // Geolocation not supported - proceed to form with default region
      setLocationData({ latitude: 0, longitude: 0, region: 'India' });
      setCurrentStep('user-details');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Reverse geocode to get region/city
          const region = await reverseGeocode(latitude, longitude);
          
          setLocationData({ latitude, longitude, region });
          setCurrentStep('user-details');
        } catch (err) {
          // Proceed to form with default region
          setLocationData({ latitude: 0, longitude: 0, region: 'India' });
          setCurrentStep('user-details');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        // User denied permission or location services are off
        // Set default region and proceed to form
        setLocationData({ latitude: 0, longitude: 0, region: 'India' });
        setCurrentStep('user-details');
        setLoading(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  /**
   * Reverse geocode coordinates to get city/region name
   * Uses OpenStreetMap Nominatim API (free, no key required)
   */
  const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const data = await response.json();
      
      // Extract state/region from response
      const state = data.address?.state || data.address?.province || data.address?.county || 'India';
      return state;
    } catch (err) {
      console.error('Reverse geocoding failed:', err);
      return 'India'; // Default fallback
    }
  };

  /**
   * Validate user details form inputs
   */
  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    // Full Name validation
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters';
    }

    // Phone Number validation (Indian format)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phoneNumber.replace(/\D/g, ''))) {
      errors.phoneNumber = 'Please enter a valid 10-digit Indian phone number';
    }

    // Birthdate validation
    if (!formData.birthdate) {
      errors.birthdate = 'Birthdate is required';
    } else {
      const birthDate = new Date(formData.birthdate);
      const today = new Date();
      const age = calculateAge(formData.birthdate);
      
      if (birthDate > today) {
        errors.birthdate = 'Birthdate cannot be in the future';
      } else if (age < 1 || age > 120) {
        errors.birthdate = 'Please enter a valid birthdate';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle user details form submission
   */
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const age = calculateAge(formData.birthdate);
      
      await saveOnboardingData({
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber.replace(/\D/g, ''),
        birthdate: formData.birthdate,
        age: age,
        preference: 'satvic', // Hardcoded to satvic
        region: locationData?.region || 'India',
        latitude: locationData?.latitude || 0,
        longitude: locationData?.longitude || 0,
      });
      setCurrentStep('completed');
    } catch (err) {
      console.error('Error saving onboarding data:', err);
      setError('Failed to save your information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Save onboarding completion status and user details to backend
   */
  const saveOnboardingData = async (data: any) => {
    try {
      // Call backend to save user details
      const payload = {
        name: data.fullName,
        phoneNumber: data.phoneNumber,
        birthdate: data.birthdate,
        age: data.age,
        preference: data.preference,
        region: data.region,
        latitude: data.latitude,
        longitude: data.longitude,
        onboardingCompleted: true,
        season: getCurrentSeason(),
      };

      // Save to backend (Users model)
      const profileResponse = await apiClient.updateUserProfile(payload);
      
      // Update AuthContext state immediately with the name from the response
      if (profileResponse.data?.user?.name || payload.name) {
        updateUser({
          name: profileResponse.data?.user?.name || payload.name,
          region: data.region,
          season: getCurrentSeason(),
        });
      }

      // Create a family member entry for the user
      const userId = await apiClient.getCurrentUserId();
      if (userId) {
        try {
          // Check if member already exists
          const existingMembers = await apiClient.getFamilyMembers(userId);
          const userMemberExists = existingMembers.data?.some(
            (m: any) => m.fullName === data.fullName
          );

          if (!userMemberExists) {
            // Create member entry for the user
            await apiClient.addFamilyMember({
              userId: userId,
              fullName: data.fullName,
              age: data.age,
              gender: 'other', // Default, can be updated later
              dietaryPreferences: data.preference === 'satvic' ? 'Satvic' : 'Vegetarian',
              state: data.region,
            });
            console.log('Created family member entry for user');
          }
        } catch (memberError) {
          console.error('Error creating family member:', memberError);
          // Don't fail onboarding if member creation fails
        }
      }

      // Also save to localStorage for immediate persistence
      const onboardingData = {
        userId,
        completedAt: new Date().toISOString(),
        ...payload,
      };
      localStorage.setItem(`onboarding_${userId}`, JSON.stringify(onboardingData));

      // Update user in session
      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        userData.onboardingCompleted = true;
        userData.name = data.fullName;
        userData.region = data.region;
        userData.season = getCurrentSeason();
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (err) {
      console.error('Error saving onboarding data:', err);
      throw err;
    }
  };

  /**
   * Handle completion and redirect
   */
  useEffect(() => {
    if (currentStep === 'completed') {
      // Small delay for UX (show success state briefly)
      const timer = setTimeout(() => {
        onComplete();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentStep, onComplete]);

  // ========== RENDER LOCATION PERMISSION STEP ==========
  if (currentStep === 'location-permission') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Welcome to Prakriti Parivar!</h2>
            <p className="text-gray-600 mt-2">Let's personalize your natural living journey</p>
          </div>

          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">📍 Share Your Location</h3>
              <p className="text-sm text-green-800">
                We'll use your location to provide region-specific meal recommendations and seasonal guidance tailored to your area.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={requestLocationPermission}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    Getting location...
                  </>
                ) : (
                  <>
                    <MapPin className="h-5 w-5" />
                    Share My Location
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setLocationData({ latitude: 0, longitude: 0, region: 'India' });
                  setCurrentStep('user-details');
                }}
                disabled={loading}
                className="w-full bg-gray-100 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Skip Location
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              🔒 Your location is only used for personalization and is never shared with third parties.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ========== RENDER USER DETAILS FORM STEP ==========
  if (currentStep === 'user-details') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 max-h-[90vh] overflow-y-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👤</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Tell Us About You</h2>
            <p className="text-gray-600 mt-2">Help us personalize your wellness experience</p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => {
                  setFormData({ ...formData, fullName: e.target.value });
                  if (formErrors.fullName) {
                    setFormErrors({ ...formErrors, fullName: undefined });
                  }
                }}
                placeholder="Enter your full name"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  formErrors.fullName
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-green-500'
                }`}
              />
              {formErrors.fullName && (
                <p className="text-sm text-red-600 mt-1">{formErrors.fullName}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => {
                  setFormData({ ...formData, phoneNumber: e.target.value.replace(/\D/g, '').slice(0, 10) });
                  if (formErrors.phoneNumber) {
                    setFormErrors({ ...formErrors, phoneNumber: undefined });
                  }
                }}
                placeholder="10-digit mobile number"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  formErrors.phoneNumber
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-green-500'
                }`}
              />
              {formErrors.phoneNumber && (
                <p className="text-sm text-red-600 mt-1">{formErrors.phoneNumber}</p>
              )}
            </div>

            {/* Birthdate */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date of Birth *
              </label>
              <input
                type="date"
                value={formData.birthdate}
                onChange={(e) => {
                  setFormData({ ...formData, birthdate: e.target.value });
                  if (formErrors.birthdate) {
                    setFormErrors({ ...formErrors, birthdate: undefined });
                  }
                }}
                max={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  formErrors.birthdate
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-green-500'
                }`}
              />
              {formErrors.birthdate && (
                <p className="text-sm text-red-600 mt-1">{formErrors.birthdate}</p>
              )}
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : (
                'Continue to Dashboard'
              )}
            </button>
          </form>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs text-blue-800">
              💡 This information helps us create personalized meal plans and wellness recommendations based on your preferences and location.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ========== RENDER COMPLETION STEP ==========
  if (currentStep === 'completed') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">All Set! 🎉</h2>
          <p className="text-gray-600 mb-6">
            Your profile is complete. Let's start your personalized wellness journey!
          </p>
          <div className="animate-pulse">
            <p className="text-sm text-green-600 font-semibold">Redirecting to dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default OnboardingFlow;
