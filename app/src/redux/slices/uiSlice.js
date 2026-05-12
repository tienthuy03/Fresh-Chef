import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoading: false,
  error: {
    visible: false,
    title: '',
    content: '',
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showLoading: (state) => {
      state.isLoading = true;
    },
    hideLoading: (state) => {
      state.isLoading = false;
    },
    showError: (state, action) => {
      state.error = {
        visible: true,
        title: action.payload.title || 'Error',
        content: action.payload.content || 'Something went wrong',
      };
    },
    hideError: (state) => {
      state.error = {
        visible: false,
        title: '',
        content: '',
      };
    },
  },
});

export const { showLoading, hideLoading, showError, hideError } = uiSlice.actions;
export default uiSlice.reducer;
