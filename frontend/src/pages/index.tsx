import { useState, useEffect } from 'react'
import axios from "axios";
import styles from "@/styles/Home.module.css"

interface Todo {
  id: number;
  title: string;
  url: string;
  dueDate: string;
}

export default function Home() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [newTodo, setNewTodo] = useState<{title: string; url: string; dueDate: string}>({title: '', url: '', dueDate: ''});
    const [editing, setEditing] = useState<boolean>(false);
    const [currentTodo, setCurrentTodo] = useState<Todo | null>(null);

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

  

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewTodo(prev => ({...prev, [e.target.name]: e.target.value}));
    }

    const createTodo = async () => {
      try {
        const res = await fetch('http://localhost:8080/todos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newTodo),
        });
    
        if (!res.ok) {
          console.log('HTTP error', res.status);
          return;
        }
    
        const todo: Todo = await res.json();
        setTodos((prevTodos) => [...(prevTodos || []), todo]);
        setNewTodo({ title: '', url: '', dueDate: '' });
      } catch (error) {
        console.error('Create Todo error: ', error);
      }
    }
      

    const updateTodo = async (id: number) => {
      const response = await axios.put(`http://localhost:8080/todos/${id}`, currentTodo);
      setTodos(todos.map((todo) => (todo.id === id ? response.data : todo)));
      setEditing(false);
      setCurrentTodo(null);
    };
  
    const deleteTodo = async (id: number) => {
      await axios.delete(`http://localhost:8080/todos/${id}`);
      setTodos(todos.filter((todo) => todo.id !== id));
    };

  
    const editTodo = (todo: Todo) => {
      setEditing(true);
      setCurrentTodo(todo);
    };
  
    return (
      <>
      <header>
        <h1>Todo List</h1>
      </header>
      <div className={styles.container}>
      {editing ? (
        <div className={styles.editBox}>
          <h2>Edit Todo</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (currentTodo) updateTodo(currentTodo.id);
            }}
            className={styles.form}
          >
          <div className={styles.editInner}>
            <div>
            <input
              type="text"
              value={currentTodo?.title || ""}
              onChange={(e) =>
                setCurrentTodo({
                  ...currentTodo!,
                  title: e.target.value,
                })
              }
            />
            </div>
            <div>
            <input
              type="text"
              value={currentTodo?.url || ""}
              onChange={(e) =>
                setCurrentTodo({
                  ...currentTodo!,
                  url: e.target.value,
                })
              }
            />
            </div>
            <div>
            <input
              type="date"
              value={currentTodo?.dueDate || ""}
              onChange={(e) =>
                setCurrentTodo({
                  ...currentTodo!,
                  dueDate: e.target.value,
                })
              }
            />
            </div>
            </div>
            <div className={styles.btns}>
              <button type="submit">Update</button>
              <button onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </form>
        </div>
      ) : (
        <div className={styles.addBox}>
          <h2>Add a Todo</h2>
          <div className={styles.form}>
            <div className={styles.formInner}>
              <input type='text' name='title' value={newTodo.title} onChange={handleChange} placeholder='Title' />
              <input type='text' name='url' value={newTodo.url} onChange={handleChange} placeholder='URL' />
              <input type='date' name='dueDate' value={newTodo.dueDate} onChange={handleChange} placeholder='Due Date' />
              <button onClick={createTodo}>Add Todo</button>
            </div>
          </div>
        </div>
      )}
        <div className={styles.viewBox}>
          <h2>View Todos</h2>
          <div className={styles.viewWrapper}>
          {todos && todos.map(todo => (
            <div key={todo?.id} className={styles.viewInner}>
              <div className={styles.viewItems}>
                <h3><a href={todo?.url}>{todo?.title}</a></h3>
                <p>Due: {todo?.dueDate}</p>
              </div>
              <button onClick={() => editTodo(todo)}>Edit</button>
              <button onClick={() => deleteTodo(todo?.id)}>Delete</button>
            </div>
          ))}
          </div>
        </div>
      </div>
    </>
    )
}
