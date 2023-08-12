export default LocalStorageSaver;

class LocalStorageSaver {
  saveObject(object, key) {
    localStorage.setItem(key, JSON.stringify(object));
  }
  getObject(key) {
    return JSON.parse(localStorage.getItem(key));
  }
  // This method is for updating properties of object
  // If no keys are given, assume the parentObject is the object itself
  // If keys are given, access the property to add/update (keys are used in array order)
  saveNestedObject(parentKey, object, keys) {
    const parent = localStorage.getItem(parentKey);
    const parentObject = JSON.parse(parent);
    const nestedProperty = this.getNestedObject(parentObject, keys);
    this.modifyEntry(nestedProperty, object);
    localStorage.setItem(parentKey, JSON.stringify(parentObject));
  }
  removeNestedObject(parentKey, keys) {
    const parent = localStorage.getItem(parentKey);
    const parentObject = JSON.parse(parent);
    console.log(parent);
    console.log(parentObject);
    const nestedPropertyParent = this.getNestedObject(parentObject, keys.slice(0, -1));
    console.log(nestedPropertyParent);
    const [id] = [keys.slice(-1)];
    console.log(id);
    nestedPropertyParent.splice(id, 1);
    localStorage.setItem(parentKey, JSON.stringify(parentObject));
  }
  // Helper function. Assigns newValue if object is not an array, appends it otherwise.
  modifyEntry(object, newValue) {
    if (object instanceof Array) {
      object.push(newValue);
    } else {
      Object.assign(object, newValue);
    }
  }
  // Helper function that gets object from a serie of keys
  getNestedObject(parentObject, keys) {
    keys = keys instanceof Array ? keys : Array.from(keys);
    let nestedProperty = parentObject;
    keys.forEach((key) => {
      nestedProperty = nestedProperty[key];
    });
    return nestedProperty;
  }
}
