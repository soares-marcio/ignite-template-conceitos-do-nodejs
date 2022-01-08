const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find(user => user.username === username);
  if (!user) {
    return response.status(404).json({ error: 'User not found' });
  }
  request.user = user;
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  const userExist = users.some(user => user.username === username);
  if (userExist) {
    response.status(400).json({error: 'User already exist.'})
  }
  const id = uuidv4();
  const user = {
    id,
    name,
    username,
    todos: []
  }
  users.push({
    ...user,
  })
  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user, body: { title, deadline } } = request;
  const id = uuidv4();
  const todo = {
    id,
    done: false,
    title,
    deadline: new Date(deadline),
    created_at: new Date(),
  }
  user.todos.push({
    ...todo
  });
  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user, params: { id }, body: { title, deadline } } = request;
  const todo = user.todos.find(todo => todo.id === id);
  if (!todo) {
    response.status(404).json({error: 'Not Found.'})
  }
  todo.title = title;
  todo.deadline = new Date(deadline);
  return response.status(200).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user, params: { id } } = request;
  const todo = user.todos.find(todo => todo.id === id);
  if (!todo) {
    response.status(404).json({error: 'Not Found.'})
  }
  todo.done = true;
  return response.status(200).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user, params: { id } } = request;
  const todoIndex = user.todos.findIndex(todo => todo.id === id);
  if (todoIndex === -1) {
    return response.status(404).json({error: 'Not Found.'})
  }
  user.todos.splice(todoIndex, 1)
  return response.status(204).json();
});

module.exports = app;