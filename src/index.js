import "reset-css";
import "./style.css";
import Task from "./classes/Task.js";
import Todo from "./classes/Todo.js";
import Project from "./classes/Project.js";
import DOMController from "./classes/DOMController";

let controller;
if (localStorage.length) {
  controller = new DOMController();
} else {
  const project = new Project("Default project");
  controller = new DOMController([project]);
}
controller.initDisplay();
