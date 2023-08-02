export default DOMController

class DOMController {
  constructor(projects = []) {
    this.projects = projects;
    this.nav = document.getElementById("projects");
    this.main = document.querySelector("main");
  }
  init_display() {
    const project_list = document.createElement("ul");
    this.projects.forEach((project) => {
      console.log(project)
      const project_tab = document.createElement("li");
      project_tab.textContent = project.name
      project_list.appendChild(project_tab);
    })
    this.nav.prepend(project_list);
    console.log(this.nav);
  }
}