import { apiService } from '../../apiService';
export class MealPlanEndPoint {
  static base = '/meal-plans';
}

export const mealPlanApi = apiService.injectEndpoints({
  endpoints: (build) => ({
    getMealPlans: build.query({
      query: ({ startDate, endDate }) => ({
        url: MealPlanEndPoint.base,
        params: { startDate, endDate }
      }),
      providesTags: ['MealPlans'],
    }),
    addMealPlan: build.mutation({
      query: (data) => ({
        url: MealPlanEndPoint.base,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['MealPlans'],
    }),
    removeMealPlan: build.mutation({
      query: (id) => ({
        url: `${MealPlanEndPoint.base}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MealPlans'],
    }),
    getMealPlanShoppingList: build.query({
      query: ({ startDate, endDate }) => ({
        url: `${MealPlanEndPoint.base}/shopping-list`,
        params: { startDate, endDate }
      }),
      providesTags: ['MealPlans', 'ShoppingList'],
    }),
  }),
});

export const {
  useGetMealPlansQuery,
  useAddMealPlanMutation,
  useRemoveMealPlanMutation,
  useGetMealPlanShoppingListQuery,
} = mealPlanApi;
