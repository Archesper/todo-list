export default DOMController;
import Project from "./Project";
import Todo from "./Todo";
import Task from "./Task";
import LocalStorageSaver from "./LocalStorageSaver";
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
    this.storageSaver = new LocalStorageSaver();
  }
  initDisplay() {
    if (localStorage.length) {
      this.loadLocalStorage();
    } else {
      this.storageSaver.saveObject(this.projects, "projects");
      this.storageSaver.saveObject(this.projects.length, "projectCount");
    }
    console.log(this.projects);
    // Add add project button event listener
    const addBtn = this.nav.querySelector("button");
    addBtn.addEventListener("click", this.eventListeners().newProject);
    this.modal.addEventListener("click", this.eventListeners().dialogCloser);
    this.modal.addEventListener("close", this.eventListeners().formReset);
    this.modal
      .querySelector("form")
      .addEventListener("submit", this.eventListeners().todoFormSubmit);
    // Make project tabs
    const projectList = document.createElement("ul");
    this.nav.prepend(projectList);
    this.projects.forEach((project, id) => this.addProject(project, id));
    // Display first project contents
    this.switchProject(this.projects[0]);
  }
  loadLocalStorage() {
    this.projects = this.storageSaver.getObject("projects");
    this.projects.forEach((project, index) => {
      const projectObject = new Project(project._name);
      // Copy todos into new object
      projectObject.todos = project.todos;
      projectObject.todos.forEach((todo, index) => {
        const {_title: title, _priority: priority, _dueDate: dueDate, _description: description} = todo;
        const todoObject = new Todo(title, description, priority, dueDate);
        // Copy tasks into new object
        todoObject.tasks = todo.tasks;
        todoObject.tasks.forEach((task, index) => {
          const {_description: description, _done: done} = task;
          const taskObject = new Task(description, done);
          todoObject.tasks[index] = taskObject;
        })
        projectObject.todos[index] = todoObject;
      })
      this.projects[index] = projectObject;
    })
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
    const details = this.main.querySelector(".active_toggle");
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
    const currentProject = this.getCurrentProject();
    if (currentProject) {
      currentProject.tab.classList.remove("active_project");
    }
    const id = this.projects.indexOf(project);
    const newActiveProject = this.nav.querySelector(`[data-id="${id}"]`);
    newActiveProject.classList.add("active_project");
    // Clear main contents
    this.main.textContent = "";
    // Add header to main
    const iconWrapper = document.createElement("div");
    iconWrapper.classList.add("icon_wrapper");
    const header = document.createElement("h2");
    header.textContent = project.name;
    header.addEventListener("keydown", this.eventListeners().headerForceSubmit);
    header.addEventListener("blur", this.eventListeners().finishProjectEdit);
    const editIcon = this.editIconComponent("project");
    const deleteIcon = this.deleteIconComponent();
    deleteIcon.dataset.type = "project";
    iconWrapper.append(header, editIcon, deleteIcon);
    this.main.append(iconWrapper, this.addTodoBtn());
    // Add grid of todos
    const grid = this.todosGrid(project);
    this.main.append(grid);
  }
  addProject(project, id) {
    const projectList = this.nav.querySelector("ul");
    const projectTab = document.createElement("li");
    projectTab.textContent = project.name;
    projectTab.dataset.id = id;
    projectTab.addEventListener("click", this.eventListeners().projectTab);
    projectList.appendChild(projectTab);
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
    const editIcon = new Image();
    editIcon.src = edit_outline;
    editIcon.addEventListener("mouseover", (event) => {
      this.eventListeners().iconHover(event, "edit");
    });
    editIcon.addEventListener("mouseout", (event) => {
      this.eventListeners().iconUnhover(event, "edit");
    });
    if (editable === "project") {
      editIcon.addEventListener(
        "click",
        this.eventListeners().beginProjectEdit
      );
    } else if (editable === "todo") {
      editIcon.addEventListener("click", (event) => {
        const index = editIcon.closest(".detail_toggle").dataset.id;
        this.eventListeners().todoFormModal(event, index);
      });
    }
    return editIcon;
  }
  deleteIconComponent() {
    const deleteIcon = new Image();
    deleteIcon.src = delete_outline;
    deleteIcon.addEventListener("mouseover", (event) => {
      this.eventListeners().iconHover(event, "delete");
    });
    deleteIcon.addEventListener("mouseout", (event) => {
      this.eventListeners().iconUnhover(event, "delete");
    });
    deleteIcon.addEventListener("click", this.eventListeners().deleteHandler);
    return deleteIcon;
  }
  todosGrid(project) {
    const grid = document.createElement("div");
    grid.classList.add("todo_grid");
    const headerText = ["Title", "Description", "Due date", "Priority"];
    const headerRow = document.createElement("div");
    headerRow.classList.add("grid_row", "grid_header");
    headerText.forEach((text) => {
      const header = document.createElement("div");
      header.textContent = text;
      headerRow.appendChild(header);
    });
    grid.append(headerRow);
    project.todos.forEach((todo, index) => {
      const row = this.todoRowComponent(todo, index);
      const details = this.todoDetailsComponent(todo, index);
      grid.append(row, details);
    });
    return grid;
  }
  todoRowComponent(todo, index) {
    let formattedDate;
    // The second condition treats edge case where dueDate is the unix 0 - 01/01/1970, to prevent display from showing None
    // when there technically is a dueDate.
    if (todo.dueDate || todo.dueDate === 0) {
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
    row.classList.add(todo.priority);
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
    const descriptionHeaderWrapper = document.createElement("div");
    descriptionHeaderWrapper.classList.add("description_header_wrapper");
    const descriptionHeader = document.createElement("h3");
    descriptionHeader.textContent = todo.title + ":";
    const editIcon = this.editIconComponent("todo");
    const deleteIcon = this.deleteIconComponent();
    deleteIcon.dataset.type = "todo";
    descriptionHeaderWrapper.append(descriptionHeader, editIcon, deleteIcon);
    const description = document.createElement("p");
    description.textContent = todo.description || "No description";
    const taskHeader = document.createElement("h3");

    taskHeader.textContent = "Tasks:";

    const tasks = todo.tasks;
    const taskNodes = tasks.map((task, index) => {
      return this.taskNodeComponent(task, index);
    });
    const newTaskWrapper = this.taskInputComponent();
    const nestedDiv = document.createElement("div");
    nestedDiv.append(
      descriptionHeaderWrapper,
      description,
      taskHeader,
      newTaskWrapper,
      ...taskNodes
    );
    details.appendChild(nestedDiv);
    details.dataset.id = index;
    return details;
  }
  taskNodeComponent(task, index) {
    const taskNode = document.createElement("div");
    const check = document.createElement("input");
    const label = document.createElement("label");
    const deleteIcon = this.deleteIconComponent();
    deleteIcon.dataset.type = "task";
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
    taskNode.append(check, label, deleteIcon);
    taskNode.classList.add("task_wrapper");
    return taskNode;
  }
  addTodoBtn() {
    const addBtn = document.createElement("button");
    addBtn.textContent = "+ Add Todo";
    addBtn.classList.add("todo_btn");
    addBtn.addEventListener("click", this.eventListeners().todoFormModal);
    return addBtn;
  }
  taskInputComponent() {
    const addBtn = document.createElement("button");
    addBtn.textContent = "+ Add Task";
    addBtn.classList.add("task_btn");
    addBtn.addEventListener("click", this.eventListeners().addTask);
    const taskInput = document.createElement("input");
    taskInput.placeholder = "Add new task...";
    taskInput.addEventListener("keydown", this.eventListeners().addTask);
    const newTaskInputWrapper = document.createElement("div");
    newTaskInputWrapper.append(taskInput, addBtn);
    newTaskInputWrapper.classList.add("task_input_wrapper");
    return newTaskInputWrapper;
  }
  eventListeners() {
    const projectTab = (event) => {
      const newActiveProject = event.target;
      this.switchProject(this.projects[newActiveProject.dataset.id]);
    };
    const newProject = (event) => {
      const id = this.projects.length;
      let projectCount = this.storageSaver.getObject("projectCount");
      projectCount += 1;
      this.storageSaver.saveObject(projectCount, "projectCount");
      const project = new Project(`Project ${projectCount}`);
      this.projects.push(project);
      this.storageSaver.saveNestedObject("projects", project, id);
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
      const {
        tab: projectTab,
        object: projectObject,
        id: projectID,
      } = this.getCurrentProject();
      const newName = event.target.textContent;
      try {
        projectObject.name = newName;
        projectTab.textContent = newName;
        this.storageSaver.saveNestedObject(
          "projects",
          projectObject,
          projectID
        );
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
        elements["description"].value = todoToEdit.description || "";
        console.log(todoToEdit.dueDate);
        elements["date"].valueAsNumber = todoToEdit.dueDate;
        elements["priority"].value = todoToEdit.priority;
        elements["index"].value = index;
      }
    };
    const todoFormSubmit = (event) => {
      event.preventDefault();
      const formElements = event.target.elements;
      const title = formElements["title"].value || undefined;
      const description = formElements["description"].value || undefined;
      let dueDate = formElements["date"].valueAsNumber;
      // Treats edge case where the dueDate is the unix 0 - 01/01/1970
      dueDate = dueDate === 0 ? dueDate : (dueDate || undefined);
      const priority = formElements["priority"].value;
      const index = formElements["index"].value;
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
          this.storageSaver.saveNestedObject("projects", newTodo, [
            this.getCurrentProject().id,
            "todos",
            index,
          ]);
        } else {
          const index = activeProjectObject.todos.length;
          activeProjectObject.append_todo(newTodo);
          currentProjectGrid.append(
            this.todoRowComponent(newTodo, index),
            this.todoDetailsComponent(newTodo, index)
          );
          this.storageSaver.saveNestedObject("projects", newTodo, [
            this.getCurrentProject().id,
            "todos",
          ]);
        }
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
      this.storageSaver.saveNestedObject("projects", correspondingTask, [
        this.getCurrentProject().id,
        "todos",
        this.getExpandedTodo().id,
        "tasks",
        taskID,
      ]);
      if (done) {
        taskLabel.classList.add("checked");
      } else {
        taskLabel.classList.remove("checked");
      }
    };
    const addTask = (event) => {
      if (event.keyCode === 13 || event.target.tagName === "BUTTON") {
        try {
          const {
            details: activeToggle,
            object: todoObject,
            id: todoID,
          } = this.getExpandedTodo();
          const taskInput = activeToggle
            .querySelector(".task_input_wrapper")
            .querySelector("input");
          const newTask = new Task(taskInput.value);
          const index = todoObject.tasks.length;
          activeToggle.firstChild.append(
            this.taskNodeComponent(newTask, index)
          );
          todoObject.append_task(newTask);
          this.storageSaver.saveNestedObject("projects", newTask, [
            this.getCurrentProject().id,
            "todos",
            todoID,
            "tasks",
          ]);
          taskInput.value = "";
        } catch (error) {
          alert("Tasks must have descriptions!");
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
            this.storageSaver.removeNestedObject("projects", [
              activeProject.id,
            ]);
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
          this.storageSaver.removeNestedObject("projects", [
            activeProject.id,
            "todos",
            todoID,
          ]);
          // The switchProject method takes care of readjusting the indexing
          this.switchProject(activeProject.object);
        } else if (type == "task") {
          const {
            details: todoDetails,
            object: todoObject,
            id: todoID,
          } = this.getExpandedTodo();
          const taskNode = event.target.parentElement;
          const taskID = taskNode.querySelector("input").dataset.id;
          taskNode.remove();
          this.storageSaver.removeNestedObject("projects", [
            activeProject.id,
            "todos",
            todoID,
            "tasks",
            taskID,
          ]);
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
