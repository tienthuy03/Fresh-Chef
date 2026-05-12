import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  isLogged: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token, refreshToken } = action.payload;
      state.user = user;
      state.token = token;
      state.refreshToken = refreshToken;
      state.isLogged = true;
    },
    logOut: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isLogged = false;
    },
    setSurveyCompleted: (state, action) => {
      if (state.user) {
        state.user.hasCompletedSurvey = action.payload;
      }
    },
  },
});

export const { setCredentials, logOut, setSurveyCompleted } = authSlice.actions;
export default authSlice.reducer;
