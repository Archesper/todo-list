export default DOMController;
import Project from "./Project";

class DOMController {
  constructor(projects = []) {
    this.projects = projects;
    this.nav = document.getElementById("projects");
    this.main = document.querySelector("main");
  }
  init_display() {
    // Add add project button event listener
    const add_btn = this.nav.querySelector("button");
    console.log(add_btn);
    add_btn.addEventListener("click", this.eventListeners().new_project);
    // Make project tabs
    const project_list = document.createElement("ul");
    this.nav.prepend(project_list);
    this.projects.forEach((project, id) => this.add_project(project, id));
    // Display first project contents
    this.switch_project(this.projects[0]);
  }
  switch_project(project) {
    // Switch highlighted project in navbar
    const current_project = this.nav.querySelector(".active_project");
    console.log(current_project);
    if (current_project) {
      current_project.classList.remove("active_project");
    }
    const id = this.projects.indexOf(project);
    const new_active_project = this.nav.querySelector(`[data-id="${id}"]`);
    new_active_project.classList.add("active_project");
    // Clear main contents
    this.main.textContent = "";
    // Add header to main
    const header = document.createElement("h2");
    header.textContent = project.name;
    this.main.appendChild(header);
    // Add grid of todos
    const grid = this.todos_grid(project);
    this.main.append(grid);
  }
  add_project(project, id) {
    const project_list = this.nav.querySelector("ul");
    const project_tab = document.createElement("li");
    project_tab.textContent = project.name;
    project_tab.dataset.id = id;
    project_tab.addEventListener("click", this.eventListeners().project_tab);
    project_list.appendChild(project_tab);
  }
  todos_grid(project) {
    const grid = document.createElement("div");
    grid.classList.add("todo_grid");
    const header_text = ["Title", "Description", "Due date", "Priority"];
    const headers = header_text.map((text) => {
      const header = document.createElement("div");
      header.textContent = text;
      header.classList.add("grid_header");
      return header;
    });
    grid.append(...headers);
    project.todos.forEach((todo) => {
      const contents = [
        todo.title,
        todo.description,
        todo.dueDate,
        todo.priority,
      ];
      const content_cells = contents.map((content) => {
        const node = document.createElement("div");
        node.classList.add(todo.priority.toLowerCase());
        node.textContent = content;
        return node;
      });
      grid.append(...content_cells);
    });
    return grid;
  }
  eventListeners() {
    const project_tab = (event) => {
      const new_active_project = event.target;
      this.switch_project(this.projects[new_active_project.dataset.id]);
    };
    const new_project = (event) => {
      const id = this.projects.length;
      const project = new Project(`Project ${id + 1}`);
      this.projects.push(project);
      this.add_project(project, id);
      this.switch_project(project);
    };
    return { project_tab, new_project };
  }
}
