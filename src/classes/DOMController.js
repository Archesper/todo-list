export default DOMController;
import Project from "./Project";
import Todo from "./Todo";
import Task from "./Task";
import edit_outline from "../assets/edit_outline.svg";
import edit_filled from "../assets/edit_filled.svg";
import delete_outline from "../assets/delete_outline.svg";
import delete_filled from "../assets/delete_filled.svg";

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
    add_btn.addEventListener("click", this.eventListeners().newProject);
    this.modal.addEventListener("click", this.eventListeners().dialogCloser);
    this.modal.addEventListener("close", this.eventListeners().formReset);
    this.modal
      .querySelector("form")
      .addEventListener("submit", this.eventListeners().todoFormSubmit);
    // Make project tabs
    const project_list = document.createElement("ul");
    this.nav.prepend(project_list);
    this.projects.forEach((project, id) => this.addProject(project, id));
    // Display first project contents
    this.switchProject(this.projects[0]);
  }
  getCurrentProject() {
    const tab = this.nav.querySelector(".active_project");
    if (!tab) {
      return undefined;
    }
    const id = tab.dataset.id;
    const object = this.projects[id];
    return {
      tab: tab,
      id: id,
      object: object,
    };
  }
  getExpandedTodo() {
    const details = this.main.querySelector(".activeToggle");
    if (!details) {
      return undefined;
    }
    const row = details.previousSibling;
    const id = row.dataset.id;
    const object = this.getCurrentProject().object.todos[id];
    return {
      details: details,
      row: row,
      id: id,
      object: object,
    };
  }
  switchProject(project) {
    // Switch highlighted project in navbar
    const current_project = this.getCurrentProject();
    if (current_project) {
      current_project.tab.classList.remove("active_project");
    }
    const id = this.projects.indexOf(project);
    const newActiveProject = this.nav.querySelector(`[data-id="${id}"]`);
    newActiveProject.classList.add("active_project");
    // Clear main contents
    this.main.textContent = "";
    // Add header to main
    const icon_wrapper = document.createElement("div");
    icon_wrapper.classList.add("icon_wrapper");
    const header = document.createElement("h2");
    header.textContent = project.name;
    header.addEventListener(
      "keydown",
      this.eventListeners().headerForceSubmit
    );
    header.addEventListener("blur", this.eventListeners().finishProjectEdit);
    const edit_icon = this.editIconComponent("project");
    const delete_icon = this.deleteIconComponent();
    delete_icon.dataset.type = "project";
    icon_wrapper.append(header, edit_icon, delete_icon);
    this.main.append(icon_wrapper, this.addTodoBtn());
    // Add grid of todos
    const grid = this.todosGrid(project);
    this.main.append(grid);
  }
  addProject(project, id) {
    const project_list = this.nav.querySelector("ul");
    const projectTab = document.createElement("li");
    projectTab.textContent = project.name;
    projectTab.dataset.id = id;
    projectTab.addEventListener("click", this.eventListeners().projectTab);
    project_list.appendChild(projectTab);
  }
  icons() {
    return {
      edit_outline: edit_outline,
      edit_filled: edit_filled,
      delete_outline: delete_outline,
      delete_filled: delete_filled,
    };
  }
  editIconComponent(editable) {
    const edit_icon = new Image();
    edit_icon.src = edit_outline;
    edit_icon.addEventListener("mouseover", (event) => {
      this.eventListeners().iconHover(event, "edit");
    });
    edit_icon.addEventListener("mouseout", (event) => {
      this.eventListeners().iconUnhover(event, "edit");
    });
    if (editable === "project") {
      edit_icon.addEventListener(
        "click",
        this.eventListeners().beginProjectEdit
      );
    } else if (editable === "todo") {
      edit_icon.addEventListener("click", (event) => {
        const index = edit_icon.closest(".detail_toggle").dataset.id;
        this.eventListeners().todoFormModal(event, index);
      });
    }
    return edit_icon;
  }
  deleteIconComponent() {
    const delete_icon = new Image();
    delete_icon.src = delete_outline;
    delete_icon.addEventListener("mouseover", (event) => {
      this.eventListeners().iconHover(event, "delete");
    });
    delete_icon.addEventListener("mouseout", (event) => {
      this.eventListeners().iconUnhover(event, "delete");
    });
    delete_icon.addEventListener("click", this.eventListeners().deleteHandler);
    return delete_icon;
  }
  todosGrid(project) {
    const grid = document.createElement("div");
    grid.classList.add("todo_grid");
    const header_text = ["Title", "Description", "Due date", "Priority"];
    const header_row = document.createElement("div");
    header_row.classList.add("grid_row", "grid_header");
    header_text.forEach((text) => {
      const header = document.createElement("div");
      header.textContent = text;
      header_row.appendChild(header);
    });
    grid.append(header_row);
    project.todos.forEach((todo, index) => {
      const row = this.todoRowComponent(todo, index);
      const details = this.todoDetailsComponent(todo, index);
      grid.append(row, details);
    });
    return grid;
  }
  todoRowComponent(todo, index) {
    let formattedDate;
    if (todo.dueDate) {
      const dateObject = new Date(todo.dueDate);
      formattedDate = `${
        dateObject.getMonth() + 1
      }/${dateObject.getDate()}/${dateObject.getFullYear()}`;
    } else {
      formattedDate = "None";
    }
    const contents = [
      todo.title,
      todo.description || "...",
      formattedDate,
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
    row.dataset.id = index;
    row.addEventListener("click", this.eventListeners().detailsExpander);
    return row;
  }
  todoDetailsComponent(todo, index) {
    const details = document.createElement("div");
    details.classList.add("detail_toggle");
    const description_header_wrapper = document.createElement("div");
    description_header_wrapper.classList.add("description_header_wrapper");
    const description_header = document.createElement("h3");
    description_header.textContent = todo.title + ":";
    const edit_icon = this.editIconComponent("todo");
    const delete_icon = this.deleteIconComponent();
    delete_icon.dataset.type = "todo";
    description_header_wrapper.append(
      description_header,
      edit_icon,
      delete_icon
    );
    const description = document.createElement("p");
    description.textContent = todo.description || "No description";
    const task_header = document.createElement("h3");

    task_header.textContent = "Tasks:";

    const tasks = todo.tasks;
    const taskNodes = tasks.map((task, index) => {
      return this.taskNodeComponent(task, index);
    });
    const new_task_wrapper = this.taskInputComponent();
    const nested_div = document.createElement("div");
    nested_div.append(
      description_header_wrapper,
      description,
      task_header,
      new_task_wrapper,
      ...taskNodes
    );
    details.appendChild(nested_div);
    details.dataset.id = index;
    return details;
  }
  taskNodeComponent(task, index) {
    const taskNode = document.createElement("div");
    const check = document.createElement("input");
    const label = document.createElement("label");
    const delete_icon = this.deleteIconComponent();
    delete_icon.dataset.type = "task";
    check.type = "checkbox";
    label.textContent = task.description;
    // Whitespaces are removed because CSS IDs cannot have whitespaces
    check.name =
      check.id =
      label.htmlFor =
        task.description.replaceAll(" ", "");
    check.checked = task.done;
    check.dataset.id = index;
    check.addEventListener("change", this.eventListeners().updateTaskStatus);
    if (task.done) {
      label.classList.add("checked");
    }
    taskNode.append(check, label, delete_icon);
    taskNode.classList.add("task_wrapper");
    return taskNode;
  }
  addTodoBtn() {
    const add_btn = document.createElement("button");
    add_btn.textContent = "+ Add Todo";
    add_btn.classList.add("todo_btn");
    add_btn.addEventListener("click", this.eventListeners().todoFormModal);
    return add_btn;
  }
  taskInputComponent() {
    const add_btn = document.createElement("button");
    add_btn.textContent = "+ Add Task";
    add_btn.classList.add("task_btn");
    add_btn.addEventListener("click", this.eventListeners().addTask);
    const taskInput = document.createElement("input");
    taskInput.placeholder = "Add new task...";
    taskInput.addEventListener("keydown", this.eventListeners().addTask);
    const new_taskInput_wrapper = document.createElement("div");
    new_taskInput_wrapper.append(taskInput, add_btn);
    new_taskInput_wrapper.classList.add("taskInput_wrapper");
    return new_taskInput_wrapper;
  }
  eventListeners() {
    const projectTab = (event) => {
      const newActiveProject = event.target;
      this.switchProject(this.projects[newActiveProject.dataset.id]);
    };
    const newProject = (event) => {
      const id = this.projects.length;
      const project = new Project(`Project ${id + 1}`);
      this.projects.push(project);
      this.addProject(project, id);
      this.switchProject(project);
    };
    const iconHover = (event, icon) => {
      const newState = this.icons()[`${icon}_filled`];
      event.target.src = newState;
    };
    const iconUnhover = (event, icon) => {
      const newState = this.icons()[`${icon}_outline`];
      event.target.src = newState;
    };
    const beginProjectEdit = (event) => {
      const activeProjectHeader = this.main.querySelector("h2");
      activeProjectHeader.contentEditable = "true";
      activeProjectHeader.focus();
    };
    const finishProjectEdit = (event) => {
      const { tab: projectTab, object: projectObject } =
        this.getCurrentProject();
      const newName = event.target.textContent;
      try {
        projectObject.name = newName;
        projectTab.textContent = newName;
      } catch (error) {
        alert("Project titles cannot exceed 75 characters");
        event.target.textContent = projectObject.name;
      } finally {
        event.target.contentEditable = "false";
      }
    };
    // This listener prevents a new line from being added when enter is pressed
    // and instead makes the header lose focus
    const headerForceSubmit = (event) => {
      if (event.keyCode == 13) {
        event.preventDefault();
        event.target.blur();
      }
    };
    const todoFormModal = (event, index) => {
      this.modal.showModal();
      if (index) {
        const form = this.modal.querySelector("form");
        const elements = form.elements;
        const todoToEdit = this.getExpandedTodo().object;
        elements["title"].value = todoToEdit.title;
        elements["description"].value = todoToEdit.description;
        elements["date"].valueAsNumber = todoToEdit.dueDate;
        elements["priority"].value = todoToEdit.priority;
        elements["index"].value = index;
      }
    };
    const todoFormSubmit = (event) => {
      event.preventDefault();
      const form_elements = event.target.elements;
      const title = form_elements["title"].value || undefined;
      const description = form_elements["description"].value || undefined;
      const dueDate = form_elements["date"].valueAsNumber;
      const priority = form_elements["priority"].value;
      const index = form_elements["index"].value;
      try {
        const newTodo = new Todo(title, description, priority, dueDate);
        const activeProjectObject = this.getCurrentProject().object;
        const currentProjectGrid = this.main.querySelector(".todo_grid");
        if (index) {
          activeProjectObject.todos[index] = newTodo;
          const updatedTodo = this.main.querySelector(
            `.grid_row[data-id="${index}"]`
          );
          const updatedTodoDetails = this.main.querySelector(
            `.detail_toggle[data-id="${index}"]`
          );
          updatedTodo.replaceWith(this.todoRowComponent(newTodo, index));
          updatedTodoDetails.replaceWith(
            this.todoDetailsComponent(newTodo, index)
          );
        } else {
          const index = activeProjectObject.todos.length;
          activeProjectObject.append_todo(newTodo);
          currentProjectGrid.append(
            this.todoRowComponent(newTodo, index),
            this.todoDetailsComponent(newTodo, index)
          );
        }
        event.target.reset();
        this.modal.close();
      } catch (error) {
        console.log(error);
        if (error instanceof RangeError) {
          alert("Todo titles cannot exceed 75 characters");
        } else if (error instanceof TypeError) {
          alert("Todos must have titles!");
        }
      }
    };
    const dialogCloser = (event) => {
      if (event.target === this.modal) {
        this.modal.close();
      }
    };
    // Reset form whenever dialog is closed
    const formReset = (event) => {
      const form = this.modal.querySelector("form");
      form.reset();
    };
    const detailsExpander = (event) => {
      const activeToggle = this.getExpandedTodo();
      const details = event.currentTarget.nextSibling;
      if (activeToggle) {
        activeToggle.details.classList.remove("active_toggle");
        if (activeToggle.details !== details) {
          details.classList.add("active_toggle");
        }
      } else {
        details.classList.add("active_toggle");
      }
    };
    const updateTaskStatus = (event) => {
      const taskID = event.target.dataset.id;
      const correspondingTask = this.getExpandedTodo().object.tasks[taskID];
      const done = event.target.checked;
      const taskLabel = event.target.nextSibling;
      correspondingTask.done = done;
      if (done) {
        taskLabel.classList.add("checked");
      } else {
        taskLabel.classList.remove("checked");
      }
    };
    const addTask = (event) => {
      if (event.keyCode === 13 || event.target.tagName === "BUTTON") {
        try {
          const { details: activeToggle, object: todoObject } =
            this.getExpandedTodo();
          const taskInput = activeToggle
            .querySelector(".taskInput_wrapper")
            .querySelector("input");
          const newTask = new Task(taskInput.value);
          const index = todoObject.tasks.length;
          activeToggle.firstChild.append(
            this.taskNodeComponent(newTask, index)
          );
          todoObject.append_task(newTask);
          taskInput.value = "";
        } catch (error) {
          alert("Tasks must have descriptions!");
          console.log(error);
        }
      }
    };
    const deleteHandler = (event) => {
      const type = event.target.dataset.type;
      if (window.confirm(`Do you really want to delete this ${type}?`)) {
        const activeProject = this.getCurrentProject();
        if (type === "project") {
          if (this.projects.length === 1) {
            alert("You can't remove your only project!");
            return;
          } else {
            const projectList = document
              .getElementById("projects")
              .querySelector("ul");
            activeProject.tab.remove();
            Array.from(projectList.childNodes)
              .slice(activeProject.id, this.projects.length)
              .forEach((project) => {
                project.dataset.id -= 1;
              });
            this.projects.splice(activeProject.id, 1);
            this.switchProject(this.projects[0]);
          }
        } else if (type === "todo") {
          const {
            details: todoDetails,
            id: todoID,
            row: todoNode,
          } = this.getExpandedTodo();
          todoDetails.remove();
          todoNode.remove();
          activeProject.object.todos.splice(todoID, 1);
          // The switchProject method takes care of readjusting the indexing
          this.switchProject(activeProject.object);
        } else if (type == "task") {
          const { details: todoDetails, object: todoObject } =
            this.getExpandedTodo();
          const taskNode = event.target.parentElement;
          const taskID = taskNode.querySelector("input").dataset.id;
          taskNode.remove();
          todoObject.tasks.splice(taskID, 1);
          const taskInputs = todoDetails.querySelectorAll(
            "input[type='checkbox']"
          );
          Array.from(taskInputs)
            .slice(taskID, taskInputs.length)
            .forEach((task) => {
              task.dataset.id -= 1;
            });
        }
      }
    };
    return {
      projectTab,
      newProject,
      iconHover,
      iconUnhover,
      beginProjectEdit,
      finishProjectEdit,
      headerForceSubmit,
      todoFormModal,
      todoFormSubmit,
      dialogCloser,
      formReset,
      detailsExpander,
      updateTaskStatus,
      addTask,
      deleteHandler,
    };
  }
}
