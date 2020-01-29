const express = require('express');

const server = express();

server.use(express.json());

// In memory database
const projects = [];

//Middlewares
server.use((req, res, next) => {
  console.count(`Amount of Requests`);
  return next();
});

function projectValidations(req, res, next) {

  const { id } = req.params;
  
  if(!id) {
    const error = new Error("Param id is required");
    error.httpStatusCode = 400;
    return next(error);
  }

  const project = projects.find((projectItem) => projectItem.id === id);

  if(!project) {
    const error = new Error(`Project with id ${id} not found.`);
    error.httpStatusCode = 404;
    return next(error);
  }

  req.project = project;

  return next();
};

//Error middleware
server.use((err, req, res, next) => {
  res.statusCode(err.httpStatusCode).json(err);
});

//Routes
server.get("/projects", (req, res) => {
  return res.json(projects);
});

server.post("/projects", (req, res, next) => {
  const { id, title } = req.body;

  // verify if the same id is used by another project
  const project = projects.find((projectItem) => projectItem.id === id);
  
  if(project) {
    const error = new Error(`There is a project wiht id ${id} in database. Please use another id.`);
    error.httpStatusCode = 400;
    return next(error);
  }
  
  projects.push({
    id : id.toString(),
    title,
    tasks: []
  });

  return res.json(projects);
});

server.post("/projects/:id/tasks", projectValidations, (req, res) => {
  const { title } = req.body;
  const project = req.project;

  project.tasks.push(title);

  return res.json(project);
});

server.put("/projects/:id", projectValidations, (req, res) => {
  const { title } = req.body;
  const project = req.project;

  project.title = title;

  return res.json(project);

});

server.delete("/projects/:id", projectValidations, (req, res) => {
  const index = projects.findIndex(projectItem => projectItem.id === req.project.id);
  projects.splice(index, 1);
  return res.send();
});

server.listen(3000, () => {
  console.log("Server listening on port 3000!")
});