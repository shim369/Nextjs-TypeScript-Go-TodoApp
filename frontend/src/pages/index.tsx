import { useState, useEffect } from 'react'
import styles from "@/styles/Home.module.css"

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
      <>
      <header>
        <h1>Todo List</h1>
      </header>
      <div className={styles.container}>
        <div className={styles.addBox}>
          <input type='text' name='title' value={newTodo.title} onChange={handleChange} placeholder='Title' />
          <input type='text' name='url' value={newTodo.url} onChange={handleChange} placeholder='URL' />
          <input type='date' name='dueDate' value={newTodo.dueDate} onChange={handleChange} placeholder='Due Date' />
          <button onClick={createTodo}>Add Todo</button>
        </div>
        <div className={styles.viewBox}>
          <div className={styles.viewWrapper}>
            {todos && todos.map(todo => (
              <div key={todo.id} className={styles.viewInner}>
                <div className={styles.viewItems}>
                  <h3><a href={todo.url}>{todo.title}</a></h3>
                  <p>Due: {todo.dueDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
    )
}
