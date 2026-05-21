import { apiService } from '../../apiService';

export const gamificationApi = apiService.injectEndpoints({
  endpoints: (builder) => ({
    getGamificationProfile: builder.query({
      query: () => '/gamification/profile',
      providesTags: ['Gamification'],
    }),
    getBadges: builder.query({
      query: () => '/gamification/badges',
      providesTags: ['Gamification'],
    }),
    addTestXp: builder.mutation({
      query: (amount) => ({
        url: '/gamification/test-xp',
        method: 'POST',
        body: { amount },
      }),
      invalidatesTags: ['Gamification'],
    }),
  }),
});

export const {
  useGetGamificationProfileQuery,
  useGetBadgesQuery,
  useAddTestXpMutation,
} = gamificationApi;
