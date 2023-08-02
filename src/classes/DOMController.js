export default DOMController;

class DOMController {
  constructor(projects = []) {
    this.projects = projects;
    this.nav = document.getElementById("projects");
    this.main = document.querySelector("main");
  }
  init_display() {
    const project_list = document.createElement("ul");
    this.projects.forEach((project) => {
      console.log(project);
      const project_tab = document.createElement("li");
      project_tab.textContent = project.name;
      project_list.appendChild(project_tab);
    });
    this.nav.prepend(project_list);
    console.log(this.nav);
    const current_project = project_list.firstChild;
    console.log(current_project);
    current_project.classList.add("active_project");
    this.switch_project(this.projects[0]);
  }
  switch_project(project) {
    // Clear main contents
    this.main.textContent = "";
    // Add header to main
    const header = document.createElement("h1");
    console.log(project.name);
    header.textContent = project.name;
    this.main.appendChild(header);
    // Add grid of todos
    const table = document.createElement("table");
    table.classList.add("todo_table");
    const header_text = ["Title", "Description", "Due date", "Priority"];
    const header_row = document.createElement("tr");
    const headers = header_text.map((text) => {
      const header = document.createElement("th");
      header.textContent = text;
      console.log(header);
      return header;
    });
    console.log(headers);
    header_row.append(...headers);
    table.appendChild(header_row);
    project.todos.forEach((todo) => {
      const row = document.createElement("tr");
      row.classList.add(todo.priority.toLowerCase());
      const contents = [
        todo.title,
        todo.description,
        todo.dueDate,
        todo.priority,
      ];
      contents.forEach((content) => {
        const node = document.createElement("td");
        node.textContent = content;
        
        row.append(node)
      });
      table.append(row);
    });
    this.main.append(table);
  }
}
