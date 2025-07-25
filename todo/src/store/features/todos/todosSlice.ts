import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { nanoid } from '@reduxjs/toolkit'

export interface Todo {
  id: string
  text: string
  done: boolean
}

const initialState: Todo[] = []

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    addTodo: {
      prepare: (text: string) => ({ payload: { id: nanoid(), text } }),
      reducer: (state, action: PayloadAction<{ id: string; text: string }>) => {
        state.push({ ...action.payload, done: false })
      },
    },
    toggleTodo: (state, action: PayloadAction<string>) => {
      const todo = state.find(t => t.id === action.payload)
      if (todo) todo.done = !todo.done
    },
    deleteTodo: (state, action: PayloadAction<string>) =>
      state.filter(t => t.id !== action.payload),
    toggleAll: state => {
      // If at least one incomplete, mark all done; else mark all not done
      const allDone = state.every(t => t.done)
      state.forEach(t => {
        t.done = !allDone
      })
    },
    clearCompleted: state => state.filter(t => !t.done),
  },
})

export const { addTodo, toggleTodo, deleteTodo, toggleAll, clearCompleted } =
  todosSlice.actions
export default todosSlice.reducer
