import { apiService } from '../../apiService';

export const preferencesApi = apiService.injectEndpoints({
  endpoints: (builder) => ({
    getQuizOptions: builder.query({
      query: () => '/preferences/options',
    }),
    submitSurvey: builder.mutation({
      query: (preferences) => ({
        url: '/preferences/submit',
        method: 'POST',
        body: { preferences },
      }),
    }),
  }),
});

export const { useGetQuizOptionsQuery, useSubmitSurveyMutation } = preferencesApi;
