import { useState, useEffect } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL

function App() {
  const [todos, setTodos] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingValue, setEditingValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // 할일 목록 불러오기
  const fetchTodos = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(API_URL)
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || '서버 오류')
      setTodos(Array.isArray(json.data) ? json.data : [])
    } catch (err) {
      setError('서버에 연결할 수 없습니다. (' + err.message + ')')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTodos()
  }, [])

  // 할일 추가
  const addTodo = async () => {
    const title = inputValue.trim()
    if (!title) return

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || '서버 오류')
      if (json.data) {
        setTodos([json.data, ...todos])
        setInputValue('')
      }
    } catch (err) {
      setError('할일 추가에 실패했습니다. (' + err.message + ')')
    }
  }

  // 완료 토글
  const toggleComplete = async (todo) => {
    try {
      const res = await fetch(`${API_URL}/${todo._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: todo.title, completed: !todo.completed }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || '서버 오류')
      if (json.data) {
        setTodos(todos.map((t) => (t._id === todo._id ? json.data : t)))
      }
    } catch (err) {
      setError('할일 수정에 실패했습니다. (' + err.message + ')')
    }
  }

  // 수정 시작
  const startEdit = (todo) => {
    setEditingId(todo._id)
    setEditingValue(todo.title)
  }

  // 수정 저장
  const saveEdit = async (id) => {
    const title = editingValue.trim()
    if (!title) return

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || '서버 오류')
      if (json.data) {
        setTodos(todos.map((t) => (t._id === id ? json.data : t)))
        setEditingId(null)
        setEditingValue('')
      }
    } catch (err) {
      setError('할일 수정에 실패했습니다. (' + err.message + ')')
    }
  }

  // 수정 취소
  const cancelEdit = () => {
    setEditingId(null)
    setEditingValue('')
  }

  // 할일 삭제
  const deleteTodo = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      setTodos(todos.filter((t) => t._id !== id))
    } catch (err) {
      setError('할일 삭제에 실패했습니다.')
    }
  }

  const completedCount = todos.filter((t) => t.completed).length

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>📝 할일 목록</h1>
          <p className="stats">
            {completedCount} / {todos.length} 완료
          </p>
        </header>

        {error && (
          <div className="error-banner">
            ⚠️ {error}
            <button className="error-close" onClick={() => setError(null)}>✕</button>
          </div>
        )}

        <div className="input-area">
          <input
            type="text"
            className="todo-input"
            placeholder="할일을 입력하세요..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTodo()}
          />
          <button className="btn btn-add" onClick={addTodo}>
            추가
          </button>
        </div>

        {loading ? (
          <div className="loading">불러오는 중...</div>
        ) : todos.length === 0 ? (
          <div className="empty">할일이 없습니다. 새로운 할일을 추가해보세요!</div>
        ) : (
          <ul className="todo-list">
            {todos.map((todo) => (
              <li key={todo._id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                {editingId === todo._id ? (
                  <div className="edit-area">
                    <input
                      type="text"
                      className="edit-input"
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(todo._id)
                        if (e.key === 'Escape') cancelEdit()
                      }}
                      autoFocus
                    />
                    <div className="edit-buttons">
                      <button className="btn btn-save" onClick={() => saveEdit(todo._id)}>저장</button>
                      <button className="btn btn-cancel" onClick={cancelEdit}>취소</button>
                    </div>
                  </div>
                ) : (
                  <div className="todo-row">
                    <button
                      className={`checkbox ${todo.completed ? 'checked' : ''}`}
                      onClick={() => toggleComplete(todo)}
                    >
                      {todo.completed ? '✓' : ''}
                    </button>
                    <span className="todo-title">{todo.title}</span>
                    <div className="action-buttons">
                      <button className="btn btn-edit" onClick={() => startEdit(todo)}>수정</button>
                      <button className="btn btn-delete" onClick={() => deleteTodo(todo._id)}>삭제</button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default App
