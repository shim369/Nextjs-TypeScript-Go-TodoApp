import { useState, useEffect } from 'react'

interface Todo {
  id: string;
  title: string;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");

  useEffect(() => {
    const fetchTodos = async () => {
      const res = await fetch('http://localhost:8080/todos')
      const todos: Todo[] = await res.json()
      setTodos(todos)
    }

    fetchTodos()
  }, [])


  const createTodo = async () => {
    const res = await fetch('http://localhost:8080/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: Date.now().toString(), title: newTodo }),
    })
    const todo: Todo = await res.json()
    setTodos((prevTodos) => [...prevTodos, todo]);
    setNewTodo('');
  }

  return (
    <div>
      <input value={newTodo} onChange={(e) => setNewTodo(e.target.value)} />
      <button onClick={createTodo}>Add Todo</button>
      {todos.map((todo) => (
        <div key={todo.id}>
          {todo.title}
        </div>
      ))}
    </div>
  )
}
