export default Task

class Task {
  constructor(description) {
    this.description = description;
    this.done = false;
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
    this._description = value;
  }
}
