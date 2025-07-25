import { configureStore } from '@reduxjs/toolkit'
import todosReducer from './features/todos/todosSlice'

export const store = configureStore({
  reducer: { todos: todosReducer },
  devTools: process.env.NODE_ENV !== 'production',
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
