import { createSlice } from '@reduxjs/toolkit'

const slice = createSlice({ name: 'ui', initialState: { sidebarOpen: false }, reducers: {
  sidebarOpened: (state) => { state.sidebarOpen = true },
  sidebarClosed: (state) => { state.sidebarOpen = false },
  sidebarToggled: (state) => { state.sidebarOpen = !state.sidebarOpen },
} })
export const { sidebarOpened, sidebarClosed, sidebarToggled } = slice.actions
export default slice.reducer
