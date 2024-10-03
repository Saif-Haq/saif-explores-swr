import { request } from 'graphql-request';
import { useState } from 'react';
import useSWR, { mutate } from 'swr';

// Types
type Todo = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

// GraphQL Queries
const GET_TODOS = `
  query {
    todos {
      id
      title
      description
      completed
      createdAt
      updatedAt
    }
  }
`;

const CREATE_TODO = `
  mutation CreateTodo($input: CreateTodoInput!) {
    createTodo(input: $input) {
      id
      title
      description
      completed
      createdAt
      updatedAt
    }
  }
`;

const DELETE_TODO = `
  mutation DeleteTodo($id: ID!) {
    deleteTodo(id: $id)
  }
`;

const UPDATE_TODO = `
  mutation UpdateTodo($id: ID!, $input: UpdateTodoInput!) {
    updateTodo(id: $id, input: $input) {
      id
      completed
    }
  }
`;

// Fetcher function
const fetcher = (query: string): Promise<{ todos: Todo[] }> =>
  request('http://localhost:3000/graphql', query);

export const Todo = () => {
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoDesc, setNewTodoDesc] = useState('');

  const { data, error } = useSWR<{ todos: Todo[] }>(GET_TODOS, fetcher);

  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTodoTitle.trim()) return;

    const variables = {
      input: {
        title: newTodoTitle,
        description: newTodoDesc
      }
    };

    try {
      await request(
        'http://localhost:3000/graphql',
        CREATE_TODO,
        variables
      );

      setNewTodoTitle('');
      setNewTodoDesc('');
      mutate(GET_TODOS);
    } catch (error) {
      console.error('Error creating todo:', error);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      await request(
        'http://localhost:3000/graphql',
        DELETE_TODO,
        { id }
      );
      mutate(GET_TODOS);
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const handleToggleComplete = async (id: string, completed: boolean) => {
    try {
      await request(
        'http://localhost:3000/graphql',
        UPDATE_TODO,
        {
          id,
          input: { completed: !completed }
        }
      );
      mutate(GET_TODOS);
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  if (error) return <div className="text-red-500">Failed to load todos</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Todo List</h1>
      <form onSubmit={handleCreateTodo} className="space-y-4 mb-6">
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Todo title"
            value={newTodoTitle}
            onChange={(e) => setNewTodoTitle(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={newTodoDesc}
            onChange={(e) => setNewTodoDesc(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Add Todo
        </button>
      </form>

      <div className="space-y-4">
        {data.todos.map((todo) => (
          <div
            key={todo.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex items-center space-x-4">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => handleToggleComplete(todo.id, todo.completed)}
                className="h-4 w-4"
              />
              <div>
                <h3 className={`font-medium ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                  {todo.title}
                </h3>
                {todo.description && (
                  <p className="text-sm text-gray-500">{todo.description}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => handleDeleteTodo(todo.id)}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};