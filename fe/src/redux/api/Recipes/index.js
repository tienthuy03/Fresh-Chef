import { apiService } from '../../apiService';

/**
 * ======================
 * ENDPOINT
 * ======================
 */
export class RecipesEndPoint {
  static list = '/recipes';
  static detail = (id) => `/recipes/${id}`;
}

/**
 * ======================
 * API SERVICE
 * ======================
 */
export const recipesApi = apiService.injectEndpoints({
  endpoints: (build) => ({
    getRecipes: build.query({
      query: () => ({
        url: RecipesEndPoint.list,
        method: 'GET',
      }),
    }),

    getRecipeDetail: build.query({
      query: (id) => ({
        url: RecipesEndPoint.detail(id),
        method: 'GET',
      }),
    }),
  }),
});

export const { useGetRecipesQuery, useGetRecipeDetailQuery } = recipesApi;
