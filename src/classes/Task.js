export default Task

class Task {
  constructor(description, done = false) {
    this.description = description;
    this.done = done;
  }
  toggle_status() {
    this.done = !this.done;
  }
  get done() {
    return this._done;
  }
  set done(value) {
    this._done = value;
  }
  get description() {
    return this._description;
  }
  set description(value) {
    if (value === undefined || value.trim() === "") {
      throw new TypeError("Tasks must have descriptions.");
    }
    this._description = value;
  }
}
