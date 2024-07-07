document.addEventListener('DOMContentLoaded', () => {
    const updateForm = document.getElementById('updateForm');
    const message = document.getElementById('message');

    
    const videoToUpdate = JSON.parse(localStorage.getItem('videoToUpdate'));

    
    if (videoToUpdate) {
        document.getElementById('videoId').value = videoToUpdate._id;
        document.getElementById('title').value = videoToUpdate.title;
        document.getElementById('description').value = videoToUpdate.description;
    } else {
        
	window.location.href = 'video.html'; }

    
    updateForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(updateForm);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('User not authenticated');
            }

            const response = await fetch(`/api/videos/${videoToUpdate._id}`, {
                method: 'PUT',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });

            if (!response.ok) {
                throw new Error('Failed to update video');
            }

            alert('Video updated successfully!');
            localStorage.removeItem('videoToUpdate'); 
            window.location.href = 'video.html'; 

        } catch (error) {
            console.error('Error updating video:', error);
            alert(`Error: ${error.message}`);
        }
    });
});

function cancelUpdate() {
    window.location.href = 'video.html'; 

