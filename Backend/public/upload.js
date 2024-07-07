document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');

    uploadForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(uploadForm);

        try {
            const response = await fetch('/api/videos/upload', {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`, 
                },
            });

            if (response.ok) {
                alert('Video uploaded successfully!');
                window.location.href = 'video.html'; 
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error uploading video:', error);
            alert('Error uploading video.');
        }
    });
});

