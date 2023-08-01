import Todo from "./Todo";

class Project {
  constructor(name) {
    this.name = name;
    this.todos = [];
  }
  get name() {
    return this._name;
  }
  set name(value) {
    if (value.length > 75) {
      throw new RangeError("Project title max 75 characters.");
    }
    this._name = value;
  }
  append_todo(todo) {
    if (!(todo instanceof Todo)) {
      throw new TypeError(`Object ${todo} is not an instance of Todo`);
    }
    this.todos.push(todo);
  }
}
