import React from 'react'
import { useAppDispatch, useAppSelector } from '../../../hooks'
import { toggleTodo, deleteTodo } from './todosSlice'

export const TodoList: React.FC = () => {
  const todos = useAppSelector(state => state.todos)
  const dispatch = useAppDispatch()

  if (todos.length === 0) return <p className="empty">Nothing yet …</p>

  return (
    <ul className="todo-list">
      {todos.map(todo => (
        <li key={todo.id} className={todo.done ? 'done' : ''}>
          <label>
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() => dispatch(toggleTodo(todo.id))}
            />
            <span>{todo.text}</span>
          </label>
          <button
            className="delete"
            aria-label="Delete"
            onClick={() => dispatch(deleteTodo(todo.id))}
          >
            ×
          </button>
        </li>
      ))}
    </ul>
  )
}
