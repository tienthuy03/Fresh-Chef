import { apiService } from '../../apiService';

/**
 * ======================
 * ENDPOINT
 * ======================
 */
export class CommunityEndPoint {
  static feed = '/community/feed';
  static postReview = '/community/reviews';
  static follow = (userId) => `/community/follow/${userId}`;
}

/**
 * ======================
 * API SERVICE
 * ======================
 */
export const communityApi = apiService.injectEndpoints({
  endpoints: (build) => ({
    getFeed: build.query({
      query: () => ({
        url: CommunityEndPoint.feed,
        method: 'GET',
      }),
    }),

    postReview: build.mutation({
      query: (formData) => ({
        url: CommunityEndPoint.postReview,
        method: 'POST',
        body: formData,
        // multipart/form-data is automatically handled by fetchBaseQuery if body is FormData
      }),
    }),
    followUser: build.mutation({
      query: (userId) => ({
        url: CommunityEndPoint.follow(userId),
        method: 'POST',
      }),
      invalidatesTags: ['Follows'],
    }),
  }),
});

export const { useGetFeedQuery, usePostReviewMutation, useFollowUserMutation } = communityApi;
