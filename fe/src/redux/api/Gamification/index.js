import { apiService } from '../../apiService';

export const gamificationApi = apiService.injectEndpoints({
  endpoints: (builder) => ({
    getGamificationProfile: builder.query({
      query: () => '/gamification/profile',
      providesTags: ['Gamification'],
    }),
  }),
});

export const {
  useGetGamificationProfileQuery,
} = gamificationApi;
