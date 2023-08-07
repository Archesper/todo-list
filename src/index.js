import "reset-css";
import "./style.css";
import Task from "./classes/Task.js";
import Todo from "./classes/Todo.js";
import Project from "./classes/Project.js";
import DOMController from "./classes/DOMController";
const projects = [new Project("Default project"), new Project("Other project")];
const todos = [
  new Todo("Todo 1", "    Lorem ipsum dolor sit amet consectetur adipisicing elit. Repudiandae, assumenda. Porro sed, sunt velit obcaecati omnis alias, maxime quam eum neque, ducimus enim accusamus similique soluta quod aliquam ex reiciendis!", "LOW"),
  new Todo("Todo 2", "A placeholder Todo", "HIGH"),
  new Todo("Todo 2", "A placeholder Todo", "MID"),
  new Todo("Todo 2", "A placeholder Todo", "URGENT", new Date(999999124496)),
];
projects[0].todos = todos;
console.log(todos);
const controller = new DOMController(projects);
controller.init_display();

