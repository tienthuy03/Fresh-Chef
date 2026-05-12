import { apiService } from '../../apiService';

/**
 * ======================
 * ENDPOINT
 * ======================
 */
export class AuthEndPoint {
  static login = '/auth/login';
  static register = '/auth/register';
  static logout = '/auth/logout';
  static changePassword = '/auth/change-password';
  static preferences = '/auth/preferences';
}

/**
 * ======================
 * API SERVICE
 * ======================
 */
export const authApi = apiService.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation({
      query: (credentials) => ({
        url: AuthEndPoint.login,
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response) => ({
        ...response,
        Data: {
          ...response.Data,
          User: {
            ...response.Data?.user,
            ID: response.Data?.user?.Id || response.Data?.user?.id,
          },
        },
      }),
    }),

    register: build.mutation({
      query: (data) => ({
        url: AuthEndPoint.register,
        method: 'POST',
        body: data,
      }),
    }),

    logout: build.mutation({
      query: (token) => ({
        url: AuthEndPoint.logout,
        method: 'POST',
        body: { token },
      }),
      transformResponse: () => ({ success: true }),
      transformErrorResponse: () => ({ success: true }),
    }),

    changePassword: build.mutation({
      query: (data) => ({
        url: AuthEndPoint.changePassword,
        method: 'POST',
        body: data,
      }),
    }),

    updatePreferences: build.mutation({
      query: (preferences) => ({
        url: AuthEndPoint.preferences,
        method: 'PUT',
        body: { preferences },
      }),
    }),
  }),
});

export const { 
  useLoginMutation, 
  useRegisterMutation, 
  useLogoutMutation, 
  useChangePasswordMutation,
  useUpdatePreferencesMutation
} = authApi;
