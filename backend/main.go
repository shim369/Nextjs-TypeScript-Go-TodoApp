package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/google/uuid"

	_ "github.com/mattn/go-sqlite3"
	"github.com/rs/cors"
)

type Todo struct {
	ID      string `json:"id"`
	Title   string `json:"title"`
	URL     string `json:"url"`
	DueDate string `json:"dueDate"`
}

var db *sql.DB

func init() {
	var err error
	db, err = sql.Open("sqlite3", "./todos.db")
	if err != nil {
		panic(err)
	}

	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS todos (
		id TEXT NOT NULL PRIMARY KEY,
		title TEXT,
		url TEXT,
		dueDate TEXT
	)`)
	if err != nil {
		panic(err)
	}
}

func main() {
	fmt.Println("Starting server at port 8080")

	http.HandleFunc("/todos/", func(w http.ResponseWriter, r *http.Request) {
		id := strings.TrimPrefix(r.URL.Path, "/todos/")
		switch r.Method {
		case http.MethodGet:
			if id != "" {
				row := db.QueryRow("SELECT id, title, url, dueDate FROM todos WHERE id = ?", id)
				var t Todo
				err := row.Scan(&t.ID, &t.Title, &t.URL, &t.DueDate)
				if err != nil {
					if err == sql.ErrNoRows {
						http.Error(w, "No such todo item", http.StatusNotFound)
					} else {
						panic(err)
					}
					return
				}
				json.NewEncoder(w).Encode(t)
			} else {
				rows, err := db.Query("SELECT id, title, url, dueDate FROM todos")
				if err != nil {
					panic(err)
				}
				defer rows.Close()

				var todos []Todo
				for rows.Next() {
					var t Todo
					err = rows.Scan(&t.ID, &t.Title, &t.URL, &t.DueDate)
					if err != nil {
						panic(err)
					}
					todos = append(todos, t)
				}
				if err = rows.Err(); err != nil {
					panic(err)
				}

				json.NewEncoder(w).Encode(todos)

			}
		case http.MethodPost:
			var t Todo
			err := json.NewDecoder(r.Body).Decode(&t)
			if err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}

			t.ID = uuid.New().String() // Generate unique ID for the new todo

			_, err = db.Exec("INSERT INTO todos (id, title, url, dueDate) VALUES (?, ?, ?, ?)",
				t.ID, t.Title, t.URL, t.DueDate)
			if err != nil {
				panic(err)
			}

			w.WriteHeader(http.StatusCreated)
			json.NewEncoder(w).Encode(t)

		case http.MethodPut:
			var t Todo
			err := json.NewDecoder(r.Body).Decode(&t)
			if err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}

			_, err = db.Exec("UPDATE todos SET title = ?, url = ?, dueDate = ? WHERE id = ?",
				t.Title, t.URL, t.DueDate, id)
			if err != nil {
				panic(err)
			}

			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(t)

		case http.MethodDelete:
			_, err := db.Exec("DELETE FROM todos WHERE id = ?", id)
			if err != nil {
				panic(err)
			}
			w.WriteHeader(http.StatusOK)
		}
	})

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	})

	handler := c.Handler(http.DefaultServeMux)
	err := http.ListenAndServe(":8080", handler)
	if err != nil {
		log.Fatalf("Error starting server: %s", err)
	}
}
