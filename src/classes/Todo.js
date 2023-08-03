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
  constructor(title, description, priority) {
    this.title = title;
    this.description = description;
    this.priority = priority;
    this.tasks = [];
    this.dueDate = Date.now();
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
    this._title = value;
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
}
