import { createSlice, nanoid } from '@reduxjs/toolkit'

const slice = createSlice({ name: 'notifications', initialState: [], reducers: {
  notificationAdded: { reducer: (state, action) => { state.push(action.payload) }, prepare: (message, tone = 'info') => ({ payload: { id: nanoid(), message, tone } }) },
  notificationRemoved: (state, action) => state.filter((item) => item.id !== action.payload),
  notificationsCleared: () => [],
} })
export const { notificationAdded, notificationRemoved, notificationsCleared } = slice.actions
export default slice.reducer
