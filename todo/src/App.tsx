import React from 'react'
import { TodoInput } from './store/features/todos/TodoInput'
import { TodoList } from './store/features/todos/TodoList'

const App: React.FC = () => (
  <div className="app">
    <h1>📝 Todolist</h1>
    <TodoInput />
    <TodoList />
  </div>
)

export default App
