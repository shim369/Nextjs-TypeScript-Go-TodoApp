import { useState, useEffect } from 'react'

interface Todo {
  id: string;
  title: string;
  url: string;
  dueDate: string;
}

export default function Home() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [newTodo, setNewTodo] = useState({title: '', url: '', dueDate: ''});

    useEffect(() => {
      const fetchTodos = async () => {
        try {
          const res = await fetch('http://localhost:8080/todos')
          if (!res.ok) {
            console.log('HTTP error', res.status);
          } else {
            const todos: Todo[] = await res.json()
            setTodos(todos)
          }
        } catch (error) {
          console.log('Fetch error: ', error);
        }
      }

      fetchTodos()
    }, [])

  


    const createTodo = async () => {
      const res = await fetch('http://localhost:8080/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: Date.now().toString(), ...newTodo }),
      })
      const todo: Todo = await res.json()
      setTodos((prevTodos) => [...prevTodos, todo]);
      setNewTodo({title: '', url: '', dueDate: ''});
    }

    const handleChange = (e: { target: { name: any; value: any; }; }) => {
      setNewTodo(prev => ({...prev, [e.target.name]: e.target.value}))
    }
  
    return (
      <div>
        <input type='text' name='title' value={newTodo.title} onChange={handleChange} placeholder='Title' />
        <input type='text' name='url' value={newTodo.url} onChange={handleChange} placeholder='URL' />
        <input type='date' name='dueDate' value={newTodo.dueDate} onChange={handleChange} placeholder='Due Date' />
        <button onClick={createTodo}>Add Todo</button>
        {todos && todos.map(todo => (
          <div key={todo.id}>
            <h3>{todo.title}</h3>
            <a href={todo.url}>{todo.url}</a>
            <p>Due: {todo.dueDate}</p>
          </div>
        ))}
      </div>
    )
}
