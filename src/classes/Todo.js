import Task from "./Task";

export default Todo;

class Todo {
  static PRIORITY_CONST() {
    return {
      LOW: "Low",
      MID: "Medium",
      HIGH: "High",
      URGENT: "Urgent",
    };
  }
  constructor(title, description, priority, dueDate) {
    this.title = title;
    this.description = description;
    this.priority = priority;
    this.tasks = [];
    this.dueDate = dueDate;
  }
  get title() {
    return this._title;
  }
  get description() {
    return this._description;
  }
  get priority() {
    return this._priority
  }
  set title(value) {
    if (value.length > 75) {
      throw new RangeError("Todo title max 75 characters.");
    }
    if (value === undefined) {
      throw new TypeError("Todos must have a title.");
    }
    this._title = value;
  }
  get dueDate() {
    if (!this._dueDate) {
      return this._dueDate;
    }
    return `${this._dueDate.getMonth()}/${this._dueDate.getDate()}/${this._dueDate.getFullYear()}`;
  }
  set description(value) {
    this._description = value;
  }
  set priority(value) {
    this._priority = this.constructor.PRIORITY_CONST()[value];
  }
  append_task(task) {
    if (!(task instanceof Task)) {
      throw new TypeError(`Object ${task} is not an instance of Task`);
    }
    this.tasks.push(task);
  }
  set dueDate(value) {
    this._dueDate = value;
  }
}
