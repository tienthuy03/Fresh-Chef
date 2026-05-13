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
  }),
});

export const { 
  useGetShoppingListQuery, 
  useAddItemToShoppingListMutation, 
  useToggleShoppingItemMutation,
  useClearShoppingListMutation
} = shoppingListApi;
