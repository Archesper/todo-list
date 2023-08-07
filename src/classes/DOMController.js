export default DOMController;
import Project from "./Project";
import Todo from "./Todo";
import edit_outline from "../assets/edit_outline.svg";
import edit_filled from "../assets/edit_filled.svg";

class DOMController {
  constructor(projects = []) {
    this.projects = projects;
    this.nav = document.getElementById("projects");
    this.main = document.querySelector("main");
    this.modal = document.querySelector("dialog");
  }
  init_display() {
    // Add add project button event listener
    const add_btn = this.nav.querySelector("button");
    add_btn.addEventListener("click", this.eventListeners().new_project);
    this.modal.addEventListener("click", this.eventListeners().dialog_closer);
    this.modal
      .querySelector("form")
      .addEventListener("submit", this.eventListeners().add_todo_submit);
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
    header.addEventListener(
      "keydown",
      this.eventListeners().header_force_submit
    );
    header.addEventListener("blur", this.eventListeners().finish_edit);
    const edit_icon = this.edit_component();
    icon_wrapper.append(header, edit_icon);
    this.main.append(icon_wrapper, this.add_todo_component());
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
    const header_row = document.createElement("div");
    header_row.classList.add("grid_row", "grid_header");
    header_text.forEach((text) => {
      const header = document.createElement("div");
      header.textContent = text;
      header_row.appendChild(header)
    });
    grid.append(header_row);
    project.todos.forEach((todo) => {
      const row = this.todo_row_component(todo);
      const details = this.todo_details_component(todo);
      grid.append(row, details);
    });
    return grid;
  }
  todo_row_component(todo) {
    const contents = [
      todo.title,
      todo.description || "...",
      todo.dueDate || "None",
      todo.priority,
    ];
    const row = document.createElement("div");
    row.classList.add("grid_row");
    row.classList.add(todo.priority.toLowerCase());
    contents.forEach((content) => {
      const node = document.createElement("div");
      node.textContent = content;
      row.append(node);
    });
    row.addEventListener("click", this.eventListeners().details_expander);
    return row;
  }
  todo_details_component(todo) {
    const details = document.createElement("div");
    details.classList.add("detail_toggle");
    const description_header = document.createElement("h3");
    description_header.textContent = "Description:"
    const description = document.createElement("p");
    description.textContent = todo.description;
    console.log(description.textContent);
    const task_header = document.createElement("h3");
    task_header.textContent = "Tasks:";
    const nested_div = document.createElement("div");
    nested_div.append(description_header, description, task_header);
    details.appendChild(nested_div);
    return details;  
  }
  edit_component() {
    const edit_icon = new Image();
    edit_icon.src = edit_outline;
    edit_icon.addEventListener("mouseover", this.eventListeners().icon_hover);
    edit_icon.addEventListener("mouseout", this.eventListeners().icon_unhover);
    edit_icon.addEventListener("click", this.eventListeners().begin_edit);
    return edit_icon;
  }
  add_todo_component() {
    const add_btn = document.createElement("button");
    add_btn.textContent = "+ Add Todo";
    add_btn.addEventListener("click", this.eventListeners().add_todo_form);
    return add_btn;
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
    };
    const finish_edit = (event) => {
      const active_project_tab = this.nav.querySelector(".active_project");
      const newName = event.target.textContent;
      const id = active_project_tab.dataset.id;
      try {
        this.projects[id].name = newName;
        active_project_tab.textContent = newName;
      } catch (error) {
        alert("Project titles cannot exceed 75 characters");
        event.target.textContent = this.projects[id].name;
      } finally {
        event.target.contentEditable = "false";
      }
    };
    // This listener prevents a new line from being added when enter is pressed
    // and instead makes the header lose focus
    const header_force_submit = (event) => {
      if (event.keyCode == 13) {
        event.preventDefault();
        event.target.blur();
      }
    };
    const add_todo_form = (event) => {
      this.modal.showModal();
    };
    const add_todo_submit = (event) => {
      event.preventDefault();
      const form_elements = event.target.elements;
      const title = form_elements["title"].value || undefined;
      const description = form_elements["description"].value || undefined;
      const dateTimestamp = form_elements["date"].valueAsNumber;
      const dueDate = dateTimestamp ? new Date(dateTimestamp) : undefined;
      const priority = form_elements["priority"].value;
      try {
        const newTodo = new Todo(title, description, priority, dueDate);
        const active_project_id =
          this.nav.querySelector(".active_project").dataset.id;
        const current_project_grid = this.main.querySelector(".todo_grid");
        this.projects[active_project_id].append_todo(newTodo);
        current_project_grid.append(this.todo_row_component(newTodo));
        event.target.reset();
        this.modal.close();
      } catch (error) {
        if (error instanceof RangeError) {
          alert("Todo titles cannot exceed 75 characters");
        } else if (error instanceof TypeError) {
          alert("Todos must have titles!");
        }
      }
    };
    const dialog_closer = (event) => {
      if (event.target === this.modal) {
        this.modal.close();
      }
    };
    const details_expander = (event) => {
      const details = event.currentTarget.nextSibling;
      const active_toggle = this.main.querySelector(".active_toggle");
      if (active_toggle) {
        active_toggle.classList.remove("active_toggle")
      }
      if (active_toggle !== details) {
        details.classList.add("active_toggle");
      }

    }
    return {
      project_tab,
      new_project,
      icon_hover,
      icon_unhover,
      begin_edit,
      finish_edit,
      header_force_submit,
      add_todo_form,
      add_todo_submit,
      dialog_closer,
      details_expander
    };
  }
}
