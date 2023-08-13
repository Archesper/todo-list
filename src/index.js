import "reset-css";
import "./style.css";
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
