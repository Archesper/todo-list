export default DOMController;
import Project from "./Project";
import edit_outline from "../assets/edit_outline.svg";
import edit_filled from "../assets/edit_filled.svg";

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
    const icon_wrapper = document.createElement("div");
    icon_wrapper.classList.add("icon_wrapper");
    const header = document.createElement("h2");
    header.textContent = project.name;
    header.addEventListener("keydown", this.eventListeners().header_force_submit);
    header.addEventListener("blur", this.eventListeners().finish_edit);
    const edit_icon = this.edit_component();
    icon_wrapper.append(header, edit_icon);
    this.main.appendChild(icon_wrapper);
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
  edit_component() {
    const edit_icon = new Image();
    edit_icon.src = edit_outline;
    edit_icon.addEventListener("mouseover", this.eventListeners().icon_hover);
    edit_icon.addEventListener("mouseout", this.eventListeners().icon_unhover);
    edit_icon.addEventListener("click", this.eventListeners().begin_edit);
    return edit_icon;
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
    const icon_hover = (event) => {
      event.target.src = edit_filled;
    };
    const icon_unhover = (event) => {
      event.target.src = edit_outline;
    };
    const begin_edit = (event) => {
      const active_project_header = this.main.querySelector("h2");
      active_project_header.contentEditable = "true";
      active_project_header.focus();
      active_project_header.ariaSelected = "true";
    };
    const finish_edit = (event) => {
      const active_project_tab = this.nav.querySelector(".active_project");
      const newName = event.target.textContent;
      active_project_tab.textContent = newName;
      const id = active_project_tab.dataset.id;
      this.projects[id].name = newName;
      console.log(this.projects);
    };
    // This listener prevents a new line from being added when enter is pressed
    // and instead makes the header lose focus
    const header_force_submit = (event) => {
      if (event.keyCode == 13) {
        event.preventDefault();
        event.target.blur();
      }
    };
    return {
      project_tab,
      new_project,
      icon_hover,
      icon_unhover,
      begin_edit,
      finish_edit,
      header_force_submit,
    };
  }
}
