import { apiService } from '../../apiService';

/**
 * ======================
 * ENDPOINT
 * ======================
 */
export class ShoppingListEndPoint {
  static list = '/shopping-list';
  static item = (id) => `/shopping-list/${id}`;
}

/**
 * ======================
 * API SERVICE
 * ======================
 */
export const shoppingListApi = apiService.injectEndpoints({
  endpoints: (build) => ({
    getShoppingList: build.query({
      query: () => ({
        url: ShoppingListEndPoint.list,
        method: 'GET',
      }),
      providesTags: ['ShoppingList'],
    }),

    addItemToShoppingList: build.mutation({
      query: (data) => ({
        url: ShoppingListEndPoint.list,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ShoppingList'],
    }),

    toggleShoppingItem: build.mutation({
      query: (id) => ({
        url: ShoppingListEndPoint.item(id),
        method: 'PATCH',
      }),
      invalidatesTags: ['ShoppingList'],
    }),

    clearShoppingList: build.mutation({
      query: () => ({
        url: ShoppingListEndPoint.list,
        method: 'DELETE',
      }),
      invalidatesTags: ['ShoppingList'],
    }),
    addBulkItemsToShoppingList: build.mutation({
      query: (items) => ({
        url: `${ShoppingListEndPoint.list}/bulk`,
        method: 'POST',
        body: { items },
      }),
      invalidatesTags: ['ShoppingList'],
    }),

    getSavedShoppingLists: build.query({
      query: () => ({
        url: '/saved-shopping-lists',
        method: 'GET',
      }),
      providesTags: ['SavedShoppingLists'],
    }),

    createSavedShoppingList: build.mutation({
      query: (data) => ({
        url: '/saved-shopping-lists',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SavedShoppingLists'],
    }),

    deleteSavedShoppingList: build.mutation({
      query: (id) => ({
        url: `/saved-shopping-lists/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SavedShoppingLists'],
    }),

    importSavedShoppingList: build.mutation({
      query: (id) => ({
        url: `/saved-shopping-lists/${id}/import`,
        method: 'POST',
      }),
      invalidatesTags: ['ShoppingList'],
    }),
  }),
});

export const { 
  useGetShoppingListQuery, 
  useAddItemToShoppingListMutation, 
  useToggleShoppingItemMutation,
  useClearShoppingListMutation,
  useAddBulkItemsToShoppingListMutation,
  useGetSavedShoppingListsQuery,
  useCreateSavedShoppingListMutation,
  useDeleteSavedShoppingListMutation,
  useImportSavedShoppingListMutation,
} = shoppingListApi;
