import { createSlice } from '@reduxjs/toolkit'

const initialState = { status: 'initializing', user: null, permissions: [], error: null }

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    sessionAuthenticated: (state, action) => { state.status = 'authenticated'; state.user = action.payload.user; state.permissions = action.payload.permissions || []; state.error = null },
    sessionAnonymous: (state, action) => { state.status = 'anonymous'; state.user = null; state.permissions = []; state.error = action.payload || null },
    sessionInitializing: (state) => { state.status = 'initializing'; state.error = null },
  },
})

export const { sessionAuthenticated, sessionAnonymous, sessionInitializing } = authSlice.actions
export default authSlice.reducer
