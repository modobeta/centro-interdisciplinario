import { combineReducers } from '@reduxjs/toolkit'
import auth from '../features/auth/store/authSlice'
import notifications from '../store/notifications/notificationsSlice'
import ui from '../store/ui/uiSlice'

export default combineReducers({ auth, notifications, ui })
