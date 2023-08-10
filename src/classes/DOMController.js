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
      object: object
    }
  }
  init_display() {
    // Add add project button event listener
    const add_btn = this.nav.querySelector("button");
    add_btn.addEventListener("click", this.eventListeners().new_project);
    this.modal.addEventListener("click", this.eventListeners().dialog_closer);
    this.modal.addEventListener("close", this.eventListeners().form_reset);
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
  icons() {
    return {
      edit_outline: edit_outline,
      edit_filled: edit_filled,
      delete_outline: delete_outline,
      delete_filled: delete_filled,
    };
  }
  switch_project(project) {
    // Switch highlighted project in navbar
    const current_project = this.getCurrentProject();
    if (current_project) {
      current_project.tab.classList.remove("active_project");
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
    header.addEventListener("blur", this.eventListeners().finish_project_edit);
    const edit_icon = this.edit_component("project");
    const delete_icon = this.delete_component();
    delete_icon.dataset.type = "project";
    icon_wrapper.append(header, edit_icon, delete_icon);
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
      header_row.appendChild(header);
    });
    grid.append(header_row);
    project.todos.forEach((todo, index) => {
      const row = this.todo_row_component(todo, index);
      const details = this.todo_details_component(todo, index);
      grid.append(row, details);
    });
    return grid;
  }
  todo_row_component(todo, index) {
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
    row.addEventListener("click", this.eventListeners().details_expander);
    return row;
  }
  todo_details_component(todo, index) {
    const details = document.createElement("div");
    details.classList.add("detail_toggle");
    const description_header_wrapper = document.createElement("div");
    description_header_wrapper.classList.add("description_header_wrapper");
    const description_header = document.createElement("h3");
    description_header.textContent = todo.title + ":";
    const edit_icon = this.edit_component("todo");
    const delete_icon = this.delete_component();
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
      return this.task_node_component(task, index);
    });
    const new_task_wrapper = this.add_task_component();
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
  task_node_component(task, index) {
    const taskNode = document.createElement("div");
    const check = document.createElement("input");
    const label = document.createElement("label");
    const delete_icon = this.delete_component();
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
    check.addEventListener("change", this.eventListeners().update_task_status);
    if (task.done) {
      label.classList.add("checked");
    }
    taskNode.append(check, label, delete_icon);
    taskNode.classList.add("task_wrapper");
    return taskNode;
  }
  edit_component(editable) {
    const edit_icon = new Image();
    edit_icon.src = edit_outline;
    edit_icon.addEventListener("mouseover", (event) => {
      this.eventListeners().icon_hover(event, "edit");
    });
    edit_icon.addEventListener("mouseout", (event) => {
      this.eventListeners().icon_unhover(event, "edit");
    });
    if (editable === "project") {
      edit_icon.addEventListener(
        "click",
        this.eventListeners().begin_project_edit
      );
    } else if (editable === "todo") {
      edit_icon.addEventListener("click", (event) => {
        const index = edit_icon.closest(".detail_toggle").dataset.id;
        this.eventListeners().add_todo_form(event, index);
      });
    }
    return edit_icon;
  }
  delete_component() {
    const delete_icon = new Image();
    delete_icon.src = delete_outline;
    delete_icon.addEventListener("mouseover", (event) => {
      this.eventListeners().icon_hover(event, "delete");
    });
    delete_icon.addEventListener("mouseout", (event) => {
      this.eventListeners().icon_unhover(event, "delete");
    });
    delete_icon.addEventListener("click", this.eventListeners().delete_handler);
    return delete_icon;
  }
  add_todo_component() {
    const add_btn = document.createElement("button");
    add_btn.textContent = "+ Add Todo";
    add_btn.classList.add("todo_btn");
    add_btn.addEventListener("click", this.eventListeners().add_todo_form);
    return add_btn;
  }
  add_task_component() {
    const add_btn = document.createElement("button");
    add_btn.textContent = "+ Add Task";
    add_btn.classList.add("task_btn");
    add_btn.addEventListener("click", this.eventListeners().add_task);
    const task_input = document.createElement("input");
    task_input.placeholder = "Add new task...";
    const new_task_input_wrapper = document.createElement("div");
    new_task_input_wrapper.append(task_input, add_btn);
    new_task_input_wrapper.classList.add("task_input_wrapper");
    return new_task_input_wrapper;
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
    const icon_hover = (event, icon) => {
      const newState = this.icons()[`${icon}_filled`];
      event.target.src = newState;
    };
    const icon_unhover = (event, icon) => {
      const newState = this.icons()[`${icon}_outline`];
      event.target.src = newState;
    };
    const begin_project_edit = (event) => {
      const active_project_header = this.main.querySelector("h2");
      active_project_header.contentEditable = "true";
      active_project_header.focus();
    };
    const finish_project_edit = (event) => {
      const {tab: projectTab, object: projectObject} = this.getCurrentProject();
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
    const header_force_submit = (event) => {
      if (event.keyCode == 13) {
        event.preventDefault();
        event.target.blur();
      }
    };
    const add_todo_form = (event, index) => {
      this.modal.showModal();
      if (index) {
        const form = this.modal.querySelector("form");
        const elements = form.elements;
        const todoToEdit = this.getExpandedTodo().object;
        elements["title"].value = todoToEdit.title;
        elements["description"].value = todoToEdit.description;
        elements["date"].valueAsNumber = todoToEdit.dueDate;
        // TODO Change priority index ( PRIORITY_CONST object )
        elements["priority"].value = todoToEdit.priority.toUpperCase();
        elements["index"].value = index;
      }
    };
    const add_todo_submit = (event) => {
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
          updatedTodo.replaceWith(this.todo_row_component(newTodo, index));
          updatedTodoDetails.replaceWith(
            this.todo_details_component(newTodo, index)
          );
        } else {
          const index = activeProjectObject.todos.length;
          activeProjectObject.append_todo(newTodo);
          currentProjectGrid.append(
            this.todo_row_component(newTodo, index),
            this.todo_details_component(newTodo, index)
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
    const dialog_closer = (event) => {
      if (event.target === this.modal) {
        this.modal.close();
      }
    };
    // Reset form whenever dialog is closed
    const form_reset = (event) => {
      const form = this.modal.querySelector("form");
      form.reset();
    };
    const details_expander = (event) => {
      const active_toggle = this.getExpandedTodo();
      const details = event.currentTarget.nextSibling;
      if (active_toggle) {
        active_toggle.details.classList.remove("active_toggle");
        if (active_toggle.details !== details) {
          details.classList.add("active_toggle");
        }
      } else {
        details.classList.add("active_toggle");
      }
    };
    const update_task_status = (event) => {
      const task_id = event.target.dataset.id;
      const corresponding_task = this.getExpandedTodo().object.tasks[task_id];
      const done = event.target.checked;
      const task_label = event.target.nextSibling;
      corresponding_task.done = done;
      if (done) {
        task_label.classList.add("checked");
      } else {
        task_label.classList.remove("checked");
      }
    };
    // TODO: make clicking enter add the task, restyle input:focus
    const add_task = (event) => {
      const task_input = event.target.previousSibling;
      try {
        const newTask = new Task(task_input.value);
        const {details: activeToggle, object: todoObject} = this.getExpandedTodo();
        const index = todoObject.tasks.length;
        activeToggle.firstChild.append(
          this.task_node_component(newTask, index)
        );
        todoObject.append_task(newTask);
      } catch (error) {
        alert("Tasks must have descriptions!");
      }
    };
    const delete_handler = (event) => {
      const type = event.target.dataset.type;
      if (window.confirm(`Do you really want to delete this ${type}?`)) {
        const active_project = this.getCurrentProject();
        if (type === "project") {
          if (this.projects.length === 1) {
            alert("You can't remove your only project!");
            return;
          } else {
            const project_list = document
              .getElementById("projects")
              .querySelector("ul");
            active_project.tab.remove();
            Array.from(project_list.childNodes)
              .slice(active_project.id, this.projects.length)
              .forEach((project) => {
                project.dataset.id -= 1;
              });
            this.projects.splice(active_project.id, 1);
            this.switch_project(this.projects[0]);
          }
        } else if (type === "todo") {
          const {details: todoDetails, id: todoID, row: todoNode} = this.getExpandedTodo();
          todoDetails.remove();
          todoNode.remove();
          active_project.object.todos.splice(todoID, 1);
          // The switch_project method takes care of readjusting the indexing
          this.switch_project(active_project.object);
        } else if (type == "task") {
          const {details: todoDetails, object: todoObject} = this.getExpandedTodo();
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
      project_tab,
      new_project,
      icon_hover,
      icon_unhover,
      begin_project_edit,
      finish_project_edit,
      header_force_submit,
      add_todo_form,
      add_todo_submit,
      dialog_closer,
      form_reset,
      details_expander,
      update_task_status,
      add_task,
      delete_handler,
    };
  }
}
