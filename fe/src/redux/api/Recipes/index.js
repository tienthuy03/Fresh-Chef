import { apiService } from '../../apiService';

/**
 * ======================
 * ENDPOINT
 * ======================
 */
export class RecipesEndPoint {
  static list = '/recipes';
  static detail = (id) => `/recipes/${id}`;
  static search = '/recipes/search';
  static categories = '/recipes/categories';
  static trending = '/recipes/trending';
  static favorite = (id) => `/recipes/${id}/favorite`;
  static favorites = '/recipes/favorites';
  static suggest = '/recipes/suggest';
  static shoppingList = (id) => `/recipes/${id}/shopping-list`;
  static globalShoppingList = '/shopping-list';
  static toggleShoppingItem = (id) => `/shopping-list/${id}`;
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
    searchRecipes: build.query({
      query: (q) => ({
        url: RecipesEndPoint.search,
        method: 'GET',
        params: { q },
      }),
    }),
    getCategories: build.query({
      query: () => ({
        url: RecipesEndPoint.categories,
        method: 'GET',
      }),
    }),
    getTrendingRecipes: build.query({
      query: () => ({
        url: RecipesEndPoint.trending,
        method: 'GET',
      }),
    }),
    toggleFavorite: build.mutation({
      query: (id) => ({
        url: RecipesEndPoint.favorite(id),
        method: 'POST',
      }),
      invalidatesTags: ['Favorites'],
    }),
    getFavorites: build.query({
      query: () => ({
        url: RecipesEndPoint.favorites,
        method: 'GET',
      }),
      providesTags: ['Favorites'],
    }),
    suggestRecipes: build.mutation({
      query: (body) => ({
        url: RecipesEndPoint.suggest,
        method: 'POST',
        body,
      }),
    }),
    getShoppingList: build.query({
      query: (id) => ({
        url: RecipesEndPoint.shoppingList(id),
        method: 'GET',
      }),
    }),
    getGlobalShoppingList: build.query({
      query: () => ({
        url: RecipesEndPoint.globalShoppingList,
        method: 'GET',
      }),
      providesTags: ['ShoppingList'],
    }),
    toggleShoppingItem: build.mutation({
      query: (id) => ({
        url: RecipesEndPoint.toggleShoppingItem(id),
        method: 'PATCH',
      }),
      invalidatesTags: ['ShoppingList'],
    }),
    clearShoppingList: build.mutation({
      query: () => ({
        url: RecipesEndPoint.globalShoppingList,
        method: 'DELETE',
      }),
      invalidatesTags: ['ShoppingList'],
    }),
    syncRecipes: build.mutation({
      query: (keyword) => ({
        url: RecipesEndPoint.sync,
        method: 'POST',
        body: { keyword },
      }),
    }),
  }),
});

export const { 
  useGetRecipesQuery, 
  useGetRecipeDetailQuery,
  useSearchRecipesQuery,
  useGetCategoriesQuery,
  useGetTrendingRecipesQuery,
  useToggleFavoriteMutation,
  useGetFavoritesQuery,
  useGetShoppingListQuery,
  useGetGlobalShoppingListQuery,
  useToggleShoppingItemMutation,
  useClearShoppingListMutation,
  useSuggestRecipesMutation,
  useSyncRecipesMutation
} = recipesApi;
