// JavaScript code to handle login form submission
document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the form from submitting in the default way

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    console.log('Form submitted with:', { email, password }); // Debugging line

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        console.log('Response status:', response.status); // Debugging line

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            // Redirect or navigate to another page upon successful login
            window.location.href = '/feed.html'; // Replace with your redirect URL
        } else {
            const errorData = await response.json();
            console.error('Login error:', errorData);
            alert('Login failed. Please check your credentials.');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('An error occurred. Please try again later.');
    }
});
