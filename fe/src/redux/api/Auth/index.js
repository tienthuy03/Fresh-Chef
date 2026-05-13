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
  static me = '/auth/me';
  static updateProfile = '/auth/profile';
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
            ...response.Data?.User,
            ID: response.Data?.User?.Id || response.Data?.User?.id,
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
    getMe: build.query({
      query: () => ({
        url: AuthEndPoint.me,
        method: 'GET',
      }),
    }),
    updateProfile: build.mutation({
      query: (data) => ({
        url: AuthEndPoint.updateProfile,
        method: 'PUT',
        body: data,
      }),
    }),
  }),
});

export const { 
  useLoginMutation, 
  useRegisterMutation, 
  useLogoutMutation, 
  useChangePasswordMutation,
  useUpdatePreferencesMutation,
  useGetMeQuery,
  useUpdateProfileMutation
} = authApi;
