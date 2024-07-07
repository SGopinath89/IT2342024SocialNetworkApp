document.addEventListener('DOMContentLoaded', function () {
    const createEventForm = document.getElementById('createEventForm');
    createEventForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
        const formData = new FormData(createEventForm);
        
        try {
            const response = await fetch('/api/events/create', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                alert('Event created successfully');
                window.location.href = 'events.html'; // Redirect after successful submission
            } else {
                const errorData = await response.json();
                alert('Error creating event: ' + errorData.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error creating event');
        }
    });

    const cancelButton = document.getElementById('cancelButton');
    cancelButton.addEventListener('click', function () {
        if (confirm('Are you sure you want to cancel creating this event?')) {
            window.location.href = 'events.html'; // Redirect to events.html on cancel
        }
    });
});



/*document.getElementById('createEventForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    
    const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
    const formData = new FormData();
    formData.append('eventname', document.getElementById('eventname').value);
    formData.append('desc', document.getElementById('desc').value);
    formData.append('img', document.getElementById('img').files[0]);
    
    try {
        const response = await fetch('/api/events/create', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
    
        // Handle response as before...
    } catch (error) {
        console.error('Error:', error);
        alert('Error creating event');
    }
    
});*/