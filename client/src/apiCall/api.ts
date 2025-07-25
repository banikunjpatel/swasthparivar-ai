const API_BASE_URL = import.meta.env.VITE_API_URI;
interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  detail?: string;
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

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(endpoint !== '/api/user/assessment' && this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log(`Making API request to: ${url}`);
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

  setTokens(accessToken: string, refreshToken: string) {
    this.token = accessToken;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  logout() {
    this.token = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  // Auth methods
  async register(userData: {
    name: string;
    email: string;
    password: string;
  }): Promise<ApiResponse> {
    return this.request('/register-family', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse> {
    return this.request('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async joinWaitList(email: string): Promise<ApiResponse> {
    return this.request('/join-waitlist', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async logoutUser(refreshToken?: string): Promise<ApiResponse> {
    return this.request('/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

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

  async calculatePrakriti(answers: any): Promise<ApiResponse> {
    return this.request(`/detect-dosha`, {
      method: 'POST',
      body: JSON.stringify({ answers: answers }),
    });
  }

  async getGroceryList(data: any): Promise<ApiResponse> {
    return this.request(`/generate-grocery`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  async getRecipeByName(data: any): Promise<ApiResponse> {
    return this.request(`/get-recipe`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;