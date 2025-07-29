let editList;

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
            objectTraverse(data);
        })
        .catch(err => {
            document.getElementById('dbContents').textContent = 'Error loading data.';
            console.log(err);
        });
});

const objectTraverse = (obj, parent = '', parentElement, depth = 0) => {

    for (const key in obj) {

        const value = obj[key];

        const detail = document.createElement('details');
        const summary = document.createElement('summary');

        summary.textContent = key;
        detail.open = true;
        detail.appendChild(summary);

        // I want to append the child element to it's last one if it exists

        const newParent = parent ? `${parent}.${key}` : key;
        console.log(newParent);

        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            objectTraverse(value, newParent, detail, depth + 1);
        } else {
            const valueNode = document.createElement('textarea')
            valueNode.textContent = value;
            detail.appendChild(valueNode);
        }

        // Append the child element to its parent if it exists
        if (parentElement) {
            parentElement.appendChild(detail);
        } else {
            // If no parentElement, append to the root editList
            editList.appendChild(detail);
        }
    }
}
