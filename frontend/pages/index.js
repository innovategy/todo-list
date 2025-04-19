import { useState, useRef, useEffect } from 'react';
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
  // Format today's date
  const formatDate = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const today = new Date();
    const dayName = days[today.getDay()];
    const date = today.getDate();
    const monthName = months[today.getMonth()];
    const year = today.getFullYear();
    
    return `${dayName} ${date} ${monthName} ${year}`;
  };
  
  const todayDate = formatDate();
  const { data, loading, error } = useQuery(GET_TASKS, { pollInterval: 5000 });
  const [createTask] = useMutation(CREATE_TASK, {
    refetchQueries: [{ query: GET_TASKS }],
  });
  const [updateTask] = useMutation(UPDATE_TASK, { refetchQueries: [{ query: GET_TASKS }] });
  const [deleteTask] = useMutation(DELETE_TASK, { refetchQueries: [{ query: GET_TASKS }] });
  const [title, setTitle] = useState('');
  const [animatingTaskId, setAnimatingTaskId] = useState(null);
  const [activeTheme, setActiveTheme] = useState('default');
  const inputRef = useRef(null);
  
  // Color themes
  const themes = {
    default: {
      name: 'Purple Dream',
      start: '#a18cd1',
      end: '#fbc2eb',
      primary: '#5e72e4'
    },
    blue: {
      name: 'Ocean Blue',
      start: '#4facfe',
      end: '#00f2fe',
      primary: '#4776E6'
    },
    green: {
      name: 'Spring Green',
      start: '#43e97b',
      end: '#38f9d7',
      primary: '#38A169'
    },
    orange: {
      name: 'Warm Sunset',
      start: '#fa709a',
      end: '#fee140',
      primary: '#ED8936'
    },
    pink: {
      name: 'Sweet Pink',
      start: '#ff9a9e',
      end: '#fad0c4',
      primary: '#D53F8C'
    }
  };
  
  // Apply theme when changed
  useEffect(() => {
    const root = document.documentElement;
    const theme = themes[activeTheme];
    
    root.style.setProperty('--bg-gradient-start', theme.start);
    root.style.setProperty('--bg-gradient-end', theme.end);
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--primary-dark', adjustColorBrightness(theme.primary, -10));
    root.style.setProperty('--primary-light', adjustColorBrightness(theme.primary, 10));
    
    // Save theme preference in localStorage
    localStorage.setItem('todoTheme', activeTheme);
  }, [activeTheme]);
  
  // Load saved theme on initial render
  useEffect(() => {
    const savedTheme = localStorage.getItem('todoTheme');
    if (savedTheme && themes[savedTheme]) {
      setActiveTheme(savedTheme);
    }
  }, []);
  
  // Helper function to adjust color brightness
  const adjustColorBrightness = (hex, percent) => {
    // Convert hex to RGB
    let r = parseInt(hex.substring(1, 3), 16);
    let g = parseInt(hex.substring(3, 5), 16);
    let b = parseInt(hex.substring(5, 7), 16);
    
    // Adjust brightness
    r = Math.max(0, Math.min(255, r + percent * 2.55));
    g = Math.max(0, Math.min(255, g + percent * 2.55));
    b = Math.max(0, Math.min(255, b + percent * 2.55));
    
    // Convert back to hex
    return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
  };

  if (loading) return <div className="loading">Loading tasks...</div>;
  if (error) return <p>Error: {error.message}</p>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    // Add subtle animation to the form
    if (inputRef.current) {
      inputRef.current.classList.add('task-complete');
      setTimeout(() => {
        if (inputRef.current) inputRef.current.classList.remove('task-complete');
      }, 500);
    }
    
    await createTask({ variables: { title } });
    setTitle('');
  };
  
  const handleTaskCompletion = async (id, completed) => {
    // Set the animating task ID to trigger animation
    setAnimatingTaskId(id);
    
    // Delay the actual update to allow animation to play
    setTimeout(() => {
      updateTask({ variables: { id, completed: !completed } });
      // Reset animating task after the animation completes
      setTimeout(() => setAnimatingTaskId(null), 500);
    }, 150);
  };

  return (
    <>
      <div className="theme-selector">
        {Object.keys(themes).map(themeKey => (
          <button 
            key={themeKey}
            className={`color-circle ${activeTheme === themeKey ? 'active' : ''}`}
            style={{ 
              background: `linear-gradient(135deg, ${themes[themeKey].start}, ${themes[themeKey].end})`,
              borderColor: activeTheme === themeKey ? themes[themeKey].primary : 'transparent'
            }}
            onClick={() => setActiveTheme(themeKey)}
            title={themes[themeKey].name}
          />
        ))}
      </div>
      <div className="container">
        <Head>
          <title>To-Do List</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        </Head>
        <div className="date-display">{todayDate}</div>
        <h1>To-Do List</h1>
      <form onSubmit={handleSubmit} className="task-form">
        <input
          ref={inputRef}
          type="text"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button type="submit">Add Task</button>
      </form>
      <ul className="task-list">
        {data.tasks.map((task) => (
          <li 
            key={task.id} 
            data-task-id={task.id}
            className={`${task.completed ? 'completed' : ''} ${animatingTaskId === task.id ? 'task-complete' : ''}`}
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => handleTaskCompletion(task.id, task.completed)}
            />
            <span>{task.title}</span>
            <button 
              className="delete-btn" 
              title="Delete task"
              onClick={() => {
                // Add fade-out animation before deletion
                const taskElement = document.querySelector(`li[data-task-id="${task.id}"]`);
                if (taskElement) {
                  taskElement.style.animation = 'fadeOut 0.3s forwards';
                  setTimeout(() => deleteTask({ variables: { id: task.id } }), 300);
                } else {
                  deleteTask({ variables: { id: task.id } });
                }
              }}
            >
              <i className="fas fa-trash-alt"></i>
            </button>
          </li>
        ))}
      </ul>
      
      {/* Show a message when no tasks exist */}
      {data.tasks.length === 0 && (
        <div className="empty-state">
          <p>You have no tasks yet. Add one to get started!</p>
        </div>
      )}
    </div>
    </>
  );
}
