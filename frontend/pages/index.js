import { useState } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import Head from 'next/head';

const GET_TASKS = gql`
  query GetTasks {
    tasks {
      id
      title
      completed
      createdAt
      updatedAt
    }
  }
`;

const CREATE_TASK = gql`
  mutation CreateTask($title: String!) {
    createTask(title: $title) {
      id
      title
      completed
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_TASK = gql`
  mutation UpdateTask($id: ID!, $completed: Boolean!) {
    updateTask(id: $id, completed: $completed) {
      id
      completed
    }
  }
`;

const DELETE_TASK = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id)
  }
`;

export default function Home() {
  const { data, loading, error } = useQuery(GET_TASKS, { pollInterval: 5000 });
  const [createTask] = useMutation(CREATE_TASK, {
    refetchQueries: [{ query: GET_TASKS }],
  });
  const [updateTask] = useMutation(UPDATE_TASK, { refetchQueries: [{ query: GET_TASKS }] });
  const [deleteTask] = useMutation(DELETE_TASK, { refetchQueries: [{ query: GET_TASKS }] });
  const [title, setTitle] = useState('');

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await createTask({ variables: { title } });
    setTitle('');
  };

  return (
    <div className="container">
      <Head>
        <title>To-Do List</title>
      </Head>
      <h1>To-Do List</h1>
      <form onSubmit={handleSubmit} className="task-form">
        <input
          type="text"
          placeholder="New task"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button type="submit">Add Task</button>
      </form>
      <ul className="task-list">
        {data.tasks.map((task) => (
          <li key={task.id} className={task.completed ? 'completed' : ''}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => updateTask({ variables: { id: task.id, completed: !task.completed } })}
            />
            <span>{task.title}</span>
            <button className="delete-btn" onClick={() => deleteTask({ variables: { id: task.id } })}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
