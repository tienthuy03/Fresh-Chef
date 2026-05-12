import { apiService } from '../../apiService';

/**
 * ======================
 * ENDPOINT
 * ======================
 */
export class CommunityEndPoint {
  static feed = '/community/feed';
  static postReview = '/community/reviews';
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
  }),
});

export const { useGetFeedQuery, usePostReviewMutation } = communityApi;
