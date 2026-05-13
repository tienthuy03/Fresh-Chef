import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoading: false,
  alert: {
    visible: false,
    title: '',
    content: '',
    type: 'error', // 'error', 'success', 'info'
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
      state.alert = {
        visible: true,
        title: action.payload.title || 'Error',
        content: action.payload.content || 'Something went wrong',
        type: 'error',
      };
    },
    showAlert: (state, action) => {
      state.alert = {
        visible: true,
        title: action.payload.title || '',
        content: action.payload.content || '',
        type: action.payload.type || 'info',
      };
    },
    hideAlert: (state) => {
      state.alert = {
        visible: false,
        title: '',
        content: '',
        type: 'info',
      };
    },
    hideError: (state) => {
      state.alert.visible = false;
    },
  },
});

export const { showLoading, hideLoading, showError, hideError, showAlert, hideAlert } = uiSlice.actions;
export default uiSlice.reducer;
