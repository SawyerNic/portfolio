
// Whole script is wrapped in this so that it runs after the dom is loaded.
document.addEventListener('DOMContentLoaded', function () {
    if (localStorage.getItem('isAdmin') !== 'true') {
        window.location.href = 'index.html';
        return;
    }

    const editList = document.getElementById('editList');

    // Fetch and display DB contents
    fetch('/api/contents')
        .then(res => res.json())
        .then(data => {
            objectTraverse(data);
            for (const key in data) {

                //create the label
                const tempLabel = document.createElement('label');
                tempLabel.textContent = key;

                //check the value
                // if (typeof data[key] === 'object' && data[key] !== null && !Array.isArray(data[key])) {

                // }

                const tempTextArea = document.createElement('textarea');

                tempTextArea.value = data[key];

                editList.appendChild(tempLabel);
                editList.appendChild(document.createElement('br'));
                editList.appendChild(tempTextArea);
                editList.appendChild(document.createElement('br'));

            }
            document.getElementById('dbContents').textContent = JSON.stringify(data, null, 2);
        })
        .catch(err => {
            document.getElementById('dbContents').textContent = 'Error loading data.';
            console.log(err);
        });
});

const objectTraverse = (obj) => {
    for (const key in obj) {
        console.log(key);
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            objectTraverse(obj[key]);
        }
    }
}