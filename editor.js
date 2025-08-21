
let editList;
let tempObj = {};

// Whole script is wrapped in this so that it runs after the dom is loaded.
document.addEventListener('DOMContentLoaded', function () {
    if (localStorage.getItem('isAdmin') !== 'true') {
        window.location.href = 'index.html';
        return;
    }

    editList = document.getElementById('editList');

    // Fetch and display DB contents
    fetch('/api/contents')
        .then(res => res.json())
        .then(data => {
            tempObj = data;
            objectTraverse(data);
        })
        .catch(err => {
            document.getElementById('dbContents').textContent = 'Error loading data.';
            console.log(err);
        });
});

// This function traverses the object from the db and makes puts all the values in editable textboxes
const objectTraverse = (obj, parent = '', parentElement, depth = 0) => {

    for (const key in obj) {

        const value = obj[key];

        // details is the header of collapsable box and summary is the contents
        const detail = document.createElement('details');
        const summary = document.createElement('summary');

        summary.textContent = key;
        detail.open = true;
        detail.appendChild(summary);

        // I want to append the child element to it's last one if it exists
        const newParent = parent ? `${parent}.${key}` : key;

        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {

            createAddButtons(summary);
            // Value is an object

            objectTraverse(value, newParent, detail, depth + 1);
        } else if (Array.isArray(value)) {

            createAddButtons(summary);


            // Traverse the array
            value.forEach((arrObj, idx) => {
                if (typeof arrObj === 'object' && arrObj !== null) {
                    objectTraverse(arrObj, newParent, detail, depth + 1);
                } else {
                    // Primitive (string, number, etc): make one textbox for the whole value
                    makeReactiveTextArea(arrObj, detail, `${newParent}[${idx}]`);
                }
            });

        } else {
            // If we're at the end of the line then we take the value and put it in a text box
            makeReactiveTextArea(value, detail, newParent);
        }

        // Append the child element to its parent if it exists
        if (parentElement) {
            parentElement.appendChild(detail);
        } else {
            // If no parentElement, append to the root editList
            editList.appendChild(detail);
        }
    } // End of Object traverse

    // Resize all the textboxes to fit all the text without overflowing
    const textboxes = document.querySelectorAll('textarea');
    textboxes.forEach(textbox => {
        autoResize(textbox);
    });
}

const makeReactiveTextArea = (myString, parentElement, parentString) => {

    // Value is a string
    const myDiv = document.createElement('div');
    myDiv.id = 'textAndButton';
    const valueNode = document.createElement('textarea');
    valueNode.value = myString;
    valueNode.name = parentString;
    valueNode.rows = 2; // Set a sensible default
    myDiv.appendChild(valueNode);

    createRemoveButtons(myDiv);
    parentElement.appendChild(myDiv);


    // Dynamically adjust the height based on content
    valueNode.style.height = 'auto'; // Reset height
    valueNode.style.height = `${valueNode.scrollHeight}px`; // Set height to content

    // Resize the textbox
    valueNode.addEventListener('input', (event) => {
        autoResize(valueNode);
        _.set(tempObj, parentString, event.target.value);
        saveObjectToDatabase(tempObj);

    });

}

async function saveObjectToDatabase(obj) {
    try {
        const response = await fetch('/api/contents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(obj)
        });
        const result = await response.json();
        console.log('Saved:', result);
        return result;
    } catch (err) {
        console.error('Error saving object:', err);
    }
}

// Auto-resizes a textarea
const autoResize = (textarea) => {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

const createAddButtons = (buttonParent) => {
    const addButton = document.createElement('button');
    addButton.id = 'addButton';
    addButton.textContent = '+';
    buttonParent.appendChild(addButton);
}

const createRemoveButtons = (buttonParent) => {
    const subtractButton = document.createElement('button');
    subtractButton.id = 'subtractButton';
    subtractButton.textContent = '-';
    buttonParent.appendChild(subtractButton);
}

