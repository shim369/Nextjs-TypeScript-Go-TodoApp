package main

import (
	"encoding/json"
	"io"
	"net/http"
	"sync"

	"github.com/rs/cors"
)

type Todo struct {
	ID    string `json:"id"`
	Title string `json:"title"`
}

var (
	todos = make([]Todo, 0)
	mutex = sync.Mutex{}
)

func main() {
	serveMux := http.NewServeMux()
	serveMux.HandleFunc("/todos", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			// GET request to get all todos
			mutex.Lock()
			defer mutex.Unlock()
			json.NewEncoder(w).Encode(todos)

		case http.MethodPost:
			// POST request to create a new todo
			mutex.Lock()
			defer mutex.Unlock()

			body, _ := io.ReadAll(r.Body)
			var todo Todo
			json.Unmarshal(body, &todo)
			todos = append(todos, todo)

			w.WriteHeader(http.StatusCreated)
			json.NewEncoder(w).Encode(todo)
		}
	})

	handler := cors.Default().Handler(serveMux)
	http.ListenAndServe(":8080", handler)
}
