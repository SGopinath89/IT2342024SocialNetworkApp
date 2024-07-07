
document.addEventListener('DOMContentLoaded', () => {
    const updateForm = document.getElementById('updateForm');
    const message = document.getElementById('message');

    
    const postToUpdate = JSON.parse(localStorage.getItem('postToUpdate'));

    
    if (postToUpdate) {
        document.getElementById('postId').value = postToUpdate._id;
        document.getElementById('title').value = postToUpdate.title;
        document.getElementById('description').value = postToUpdate.description;
    } else {
        /
        window.location.href = 'profile.html'; 

    
    updateForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(updateForm);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('User not authenticated');
            }

            const response = await fetch(`/api/profile/${postToUpdate._id}`, {
                method: 'PUT',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });

            if (!response.ok) {
                throw new Error('Failed to update post');
            }

            alert('post updated successfully!');
            localStorage.removeItem('postToUpdate'); 
            window.location.href = 'profile.html'; 

        } catch (error) {
            console.error('Error updating post:', error);
            alert(`Error: ${error.message}`);
        }
    });
});

function cancelUpdate() {
    window.location.href = 'profile.html'; 
}
