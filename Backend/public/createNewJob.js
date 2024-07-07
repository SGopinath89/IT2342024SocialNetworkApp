document.getElementById('jobForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent the form from submitting the traditional way

    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const company = document.getElementById('company').value;
    const location = document.getElementById('location').value;
    const applyLink = document.getElementById('applyLink').value;

    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token);

    if (!token) {
        alert('No token found. Please log in first.');
        return;
    }

    try {
        const response = await fetch('/api/jobs/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title,
                description,
                company,
                location,
                applyLink,
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Job created successfully!');
            window.location.href = 'job.html';
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error: ' + error.message);
    }
});
