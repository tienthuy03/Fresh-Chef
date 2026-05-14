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
  static likeReview = (reviewId) => `/community/reviews/${reviewId}/like`;
  static users = '/community/users';
}

/**
 * ======================
 * API SERVICE
 * ======================
 */
export const communityApi = apiService.injectEndpoints({
  endpoints: (build) => ({
    getFeed: build.query({
      query: (type = 'discover') => ({
        url: CommunityEndPoint.feed,
        method: 'GET',
        params: { type },
      }),
      providesTags: ['Feed'],
    }),

    getUsers: build.query({
      query: () => ({
        url: CommunityEndPoint.users,
        method: 'GET',
      }),
      providesTags: ['Follows'],
    }),

    postReview: build.mutation({
      query: (formData) => ({
        url: CommunityEndPoint.postReview,
        method: 'POST',
        body: formData,
        // multipart/form-data is automatically handled by fetchBaseQuery if body is FormData
      }),
      invalidatesTags: ['Feed'],
    }),
    followUser: build.mutation({
      query: (userId) => ({
        url: CommunityEndPoint.follow(userId),
        method: 'POST',
      }),
      invalidatesTags: ['Follows', 'Feed'],
    }),
    likeReview: build.mutation({
      query: (reviewId) => ({
        url: `/community/reviews/${reviewId}/like`,
        method: 'POST',
      }),
      invalidatesTags: ['Feed'],
    }),
    deleteReview: build.mutation({
      query: (reviewId) => ({
        url: `/community/reviews/${reviewId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Feed'],
    }),
    updateReview: build.mutation({
      query: ({ reviewId, data }) => ({
        url: `/community/reviews/${reviewId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Feed'],
    }),
  }),
});

export const { 
  useGetFeedQuery, 
  useGetUsersQuery, 
  useFollowUserMutation, 
  usePostReviewMutation, 
  useLikeReviewMutation,
  useDeleteReviewMutation,
  useUpdateReviewMutation
} = communityApi;
