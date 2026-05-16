const API_BASE_URL = import.meta.env.VITE_API_URI;
interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  otp?: string;
  success?: boolean;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('accessToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('accessToken');
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(endpoint !== '/api/user/assessment' && token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // Handle token expiration
        if (response.status === 401 && errorData.code === 'TOKEN_EXPIRED') {
          const refreshSuccess = await this.refreshToken();
          if (refreshSuccess) {
            // Retry the request with new token
            return this.request(endpoint, options);
          }
        }

        return {
          error: errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`
        };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('API request failed:', error);

      // Provide more specific error messages
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          error: `Unable to connect to server at ${this.baseURL}. Please ensure the backend server is running.`
        };
      }

      return { error: 'Network error occurred' };
    }
  }

  private async refreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      this.logout();
      return false;
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.setTokens(data.tokens.accessToken, data.tokens.refreshToken);
        return true;
      } else {
        this.logout();
        return false;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.logout();
      return false;
    }
  }

  setTokens(accessToken: string, refreshToken?: string) {
    this.token = accessToken;
    localStorage.setItem('accessToken', accessToken);
    // localStorage.setItem('refreshToken', refreshToken);
  }

  logout() {
    this.token = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  // Auth methods
  async register(userData: any): Promise<ApiResponse> {
    return this.request('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(loginData: any): Promise<ApiResponse> {
    return this.request('/users/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    });
  }

  async sendSMS(phone: string): Promise<ApiResponse> {
    const payload = {
      phone: `91${phone}`
    };

    return this.request('/otp/send-sms', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // async logoutUser(refreshToken?: string): Promise<ApiResponse> {
  // return this.request('/logout', {
  //   method: 'POST',
  //   body: JSON.stringify({ refreshToken }),
  // });
  // }

  async getCurrentUser(): Promise<ApiResponse> {
    const stored = localStorage.getItem('user');
    return stored ? { data: JSON.parse(stored) } : { error: 'No user found' };
  }

  async getCurrentUserId(): Promise<any> {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored)?.userId : null;
  }

  // User profile methods
  async updateProfile(profileData: any): Promise<ApiResponse> {
    return this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async completeAssessment(assessmentData: {
    prakriti: string;
    currentDosha: any;
  }): Promise<ApiResponse> {
    return this.request('/user/assessment', {
      method: 'POST',
      body: JSON.stringify(assessmentData),
    });
  }

  // Meal plan methods
  async getMealPlans(params?: {
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/meal-plans${queryParams.toString() ? `?${queryParams}` : ''}`;
    return this.request(endpoint);
  }

  async getMealPlanByDate(date: string): Promise<ApiResponse> {
    return this.request(`/meal-plans/date/${date}`);
  }

  async getMealPlan(user_id?: string): Promise<ApiResponse> {
    return this.request(`/get-all-family-meals/${user_id}`);
  }

  async getMealPlanByMember(member: any, weekStart?: any): Promise<ApiResponse> {
    return this.request(`/generate-meal/${member[0]._id}`, {
      method: 'POST',
      body: JSON.stringify({ weekStart: weekStart }),
    });
  }

  async generateMealPlan(user_id: string, weekStart?: any): Promise<ApiResponse> {
    return this.request(`/generate-family-meal/${user_id}`, {
      method: 'POST',
      body: JSON.stringify({ weekStart: weekStart }),
    });
  }

  async generateMealPlanV2(payload: {
    userId: string;
    weekStart: string;
    region: string;
    dietType: 'vegetarian' | 'satvic' | 'vegan' | 'non_veg' | 'eggs_ok' | 'veg';
    members: Array<{ name: string; dosha: 'vata' | 'pitta' | 'kapha' | 'tridoshic' }>;
    model?: string | null;
    prompt_version?: number | null;
    force?: boolean;
  }): Promise<ApiResponse> {
    return this.request('/meal-plan/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async saveMealPlan(mealPlanData: any): Promise<ApiResponse> {
    return this.request('/meal-plans', {
      method: 'POST',
      body: JSON.stringify(mealPlanData),
    });
  }

  async deleteMealPlan(id: string): Promise<ApiResponse> {
    return this.request(`/meal-plans/${id}`, {
      method: 'DELETE',
    });
  }

  async getFamilyMembers(userId: string): Promise<ApiResponse> {
    return this.request(`/members/${userId}`);
  }

  async addFamilyMember(memberData: any): Promise<ApiResponse> {
    return this.request('/member', {
      method: 'POST',
      body: JSON.stringify(memberData),
    });
  }



  async updateFamilyMember(id: string, memberData: any): Promise<ApiResponse> {
    return this.request(`/members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(memberData),
    });
  }

  async deleteFamilyMember(id: string): Promise<ApiResponse> {
    return this.request(`/members/${id}`, {
      method: 'DELETE',
    });
  }

  async calculatePrakriti(requestData: {
    profile: {
      name: string;
      age?: number;
      gender?: string;
      region?: string;
    };
    questions: Array<{ question: string; answer: string }>;
  }): Promise<ApiResponse> {
    // Legacy LLM-based endpoint (deprecated)
    return this.request('/prakriti/assessment', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  async calculatePrakritiRuleBased(requestData: {
    memberId: string;
    answers: Record<string, string>;
  }): Promise<ApiResponse> {
    // New rule-based endpoint (recommended)
    return this.request('/prakriti/assessment/rule-based', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  async getGroceryList(data: any): Promise<ApiResponse> {
    return this.request(`/generate-grocery`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  async getRecipeByName(data: {
    userId: string;
    dish: string;
    region: string;
    dietType: 'vegetarian' | 'satvic' | 'vegan' | 'non_veg' | 'eggs_ok' | 'veg';
    servings: number;
    force?: boolean;
  }): Promise<ApiResponse> {
    return this.request(`/recipe/generate`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUserProfile(data: any): Promise<ApiResponse> {
    const userId = await this.getCurrentUserId();
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getTodayTask(userId: string): Promise<ApiResponse> {
    return this.request(`/tasks/today?userId=${encodeURIComponent(userId)}`);
  }

  async completeTask(taskId: string, userId: string): Promise<ApiResponse> {
    return this.request('/tasks/complete', {
      method: 'POST',
      body: JSON.stringify({ taskId, userId }),
    });
  }

  async getStreak(userId: string): Promise<ApiResponse> {
    return this.request(`/tasks/streak?userId=${encodeURIComponent(userId)}`);
  }

  async resetJourney(userId: string): Promise<ApiResponse> {
    return this.request('/tasks/reset-journey', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async getFamilyNature(userId: string): Promise<ApiResponse> {
    return this.request(`/members/family-nature/${userId}`);
  }

  async getFamilyGuidance(userId: string): Promise<ApiResponse> {
    return this.request(`/family-guidance/${userId}`);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;