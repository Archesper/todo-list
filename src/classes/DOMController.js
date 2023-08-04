export default DOMController;

class DOMController {
  constructor(projects = []) {
    this.projects = projects;
    this.nav = document.getElementById("projects");
    this.main = document.querySelector("main");
  }
  init_display() {
    const project_list = document.createElement("ul");
    this.nav.prepend(project_list);
    this.projects.forEach((project, id) => this.add_project(project, id));
    const current_project = project_list.firstChild;
    current_project.classList.add("active_project");
    this.switch_project(this.projects[0]);
  }
  switch_project(project) {
    // Clear main contents
    this.main.textContent = "";
    // Add header to main
    const header = document.createElement("h1");
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
    project_tab.addEventListener('click', this.eventListeners().project_tab)
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
  eventListeners()  {
    const project_tab = (event) => {
      const current_project = this.nav.querySelector(".active_project");
      current_project.classList.remove("active_project");
      const new_active_project = event.target;
      new_active_project.classList.add("active_project");
      this.switch_project(this.projects[new_active_project.dataset.id]);
    }
    return {project_tab}
  }
}



