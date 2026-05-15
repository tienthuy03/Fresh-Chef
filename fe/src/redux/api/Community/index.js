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
    getComments: build.query({
      query: (reviewId) => ({
        url: `/community/reviews/${reviewId}/comments`,
        method: 'GET',
      }),
      providesTags: (result, error, reviewId) => [{ type: 'Comments', id: reviewId }],
    }),
    getRecipeReviews: build.query({
      query: (recipeId) => ({
        url: `/community/recipes/${recipeId}/reviews`,
        method: 'GET',
      }),
      providesTags: (result, error, recipeId) => [{ type: 'RecipeReviews', id: recipeId }],
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
      }),
      invalidatesTags: ['Feed', 'RecipeReviews'],
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
    shareReview: build.mutation({
      query: (reviewId) => ({
        url: `/community/reviews/${reviewId}/share`,
        method: 'POST',
      }),
    }),
    postComment: build.mutation({
      query: ({ reviewId, content }) => ({
        url: `/community/reviews/${reviewId}/comments`,
        method: 'POST',
        body: { content },
      }),
      invalidatesTags: (result, error, { reviewId }) => ['Feed', { type: 'Comments', id: reviewId }],
    }),
  }),
});

export const { 
  useGetFeedQuery,
  useGetCommentsQuery,
  useGetRecipeReviewsQuery,
  useGetUsersQuery, 
  useFollowUserMutation, 
  usePostReviewMutation, 
  useLikeReviewMutation,
  useDeleteReviewMutation,
  useUpdateReviewMutation,
  useShareReviewMutation,
  usePostCommentMutation
} = communityApi;
