import React, { useState } from 'react'
import { useAppDispatch } from '../../../hooks'
import { addTodo, toggleAll, clearCompleted } from './todosSlice'

export const TodoInput: React.FC = () => {
  const [text, setText] = useState('')
  const dispatch = useAppDispatch()

  const handleAdd = () => {
    const trimmed = text.trim()
    if (trimmed) {
      dispatch(addTodo(trimmed))
      setText('')
    }
  }

  return (
    <div className="input-row">
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="What needs to be done?"
        onKeyDown={e => e.key === 'Enter' && handleAdd()}
        aria-label="Todo text"
      />
      <button onClick={handleAdd}>Add</button>
      <button onClick={() => dispatch(toggleAll())}>Toggle‑all</button>
      <button onClick={() => dispatch(clearCompleted())}>Clear completed</button>
    </div>
  )
}
