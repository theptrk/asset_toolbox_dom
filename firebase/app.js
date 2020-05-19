const db = firebase.firestore();
const form = document.getElementById("my-form")
const inputText = document.getElementById("todo_input")
const resourceList = document.getElementById("resource_list")
const resourceListCompleted = document.getElementById("resource_list_completed")

var time_7_days = 1000 * 60 * 60 * 24 * 7
var timestamp_7_days_ago = (new Date(Date.now() - time_7_days))

const todoItem  = (id, data) => {
  const checkbox = data.completed 
    ? `<input type="checkbox" checked onclick='handleCheckbox(this)'/>`
    : `<input type="checkbox" onclick='handleCheckbox(this)'/>`

  const updatedAt = data.updatedAt.toDate()
  
  return `
    <li data-id=${id} id="${id}">
      ${checkbox}
      ${data.title}
      - ${updatedAt}
    </li>`;
}

form.addEventListener("submit", handleFormSubmit);

function handleFormSubmit(e) {
  e.preventDefault();
  createTodo(inputText.value);
  form.reset();
}

function handleCheckbox(e) {
  const completed = e.checked
  const id = e.parentElement.dataset.id;
  updateTodo(id, completed)
}

function createTodo(title) {
  db.collection("todos").add({
    title: title,
    completed: false,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  })
  .then(function(docRef) {
    console.log("Document written with ID: ", docRef.id);
  })
  .catch(function(error) {
    console.error("Error adding document: ", error);
  });
}

function updateTodo(id, completed) {
  const todoRef = db.collection("todos").doc(id);
  return todoRef.update({
    completed: completed,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  })
  .then(function() {
      console.log("Document successfully updated!");
  })
  .catch(function(error) {
      // The document probably doesn't exist.
      console.error("Error updating document: ", error);
  });
}

db.collection("todos").where('completed', '==', false)
  .onSnapshot(function(snapshot) {
    snapshot.docChanges().forEach(function(change) {
      const id = change.doc.id;
      const data = change.doc.data();
      if (change.type === "added") {
        resourceList.innerHTML = resourceList.innerHTML + todoItem(id, data)
        console.log("New todo: ", data);
      }
      if (change.type === "modified") {
        const item = document.getElementById(id);
        if (item) {
          item.remove()
        }
        resourceList.innerHTML = resourceList.innerHTML + todoItem(id, data)
        console.log("Modified todo: ", data);
      }
      if (change.type === "removed") {
        const item = document.getElementById(id);
        if (item) {
          item.remove()
        }
        console.log("Removed todo: ", data);
      }
    });
  });

db.collection("todos")
  .where('updatedAt', '>', timestamp_7_days_ago)
  .where("completed", "==", true)
    .onSnapshot(function(snapshot) {
      snapshot.docChanges().forEach(function(change) {
        const id = change.doc.id;
        const data = change.doc.data();
        if (change.type === "added") {
          resourceListCompleted.innerHTML = resourceListCompleted.innerHTML + todoItem(id, data)
          console.log("New todo: ", data);
        }
        if (change.type === "modified") {
          const item = document.getElementById(id);
          if (item) {
            item.remove()
          }
          resourceListCompleted.innerHTML = resourceListCompleted.innerHTML + todoItem(id, data)
          console.log("Modified todo: ", data);
        }
        if (change.type === "removed") {
          const item = document.getElementById(id);
          if (item) {
            item.remove()
          }
          console.log("Removed todo: ", data);
        }
      });
    })
