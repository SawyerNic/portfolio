
// Whole script is wrapped in this so that it runs after the dom is loaded.
document.addEventListener('DOMContentLoaded', function () {

    // Show modal on logo click
    document.getElementById('logo').onclick = function () {
        document.getElementById('loginModal').style.display = 'flex';
    };
    // Close modal
    document.getElementById('closeModal').onclick = function () {
        document.getElementById('loginModal').style.display = 'none';
        document.getElementById('loginError').style.display = 'none';
    };

    // Simple login logic (for demo only)
    window.login = function () {
        const user = document.getElementById('adminUser').value;
        const pass = document.getElementById('adminPass').value;

        fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, password: pass })
        })
            .then(res => {
                if (!res.ok) throw new Error('Invalid credentials');
                return res.json();
            })
            .then(data => {
                localStorage.setItem('isAdmin', 'true');
                window.location.href = 'editor.html';
            })
            .catch(() => {
                document.getElementById('loginError').style.display = 'block';
            });
    }

    // Fetch and display DB contents 
    fetch('http://localhost:3000/api/contents')
        .then(res => res.json())
        .then(data => {
            document.getElementById('dbContents').textContent = JSON.stringify(data, null, 2);

            let interestsEl = document.getElementById('personalInterests');
            let focusEl = document.getElementById('currentFocus');

            console.log(data.aboutMe.personalInterests);

            data.aboutMe.currentFocus.forEach(element => {
                let li = document.createElement('li');
                li.textContent = element;
                focusEl.appendChild(li);
            })

            data.aboutMe.personalInterests.forEach(element => {
                let li = document.createElement('li');
                li.textContent = element;
                interestsEl.appendChild(li);

            });

            data.projects.forEach(element => {
                let projectDiv = document.createElement('div');
                
            })

        })
        .catch(err => {
            console.log(err);
            document.getElementById('dbContents').textContent = 'Error loading data.';
        });



});

