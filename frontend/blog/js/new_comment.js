// comment_form.js

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('post-form');
  
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
  
      const name = document.getElementById('post-title').value.trim();
      const comment = document.getElementById('post-content').value.trim();
      const honeypot = document.querySelector('[name="honeypot"]').value;
  
      if (!name || !comment) {
        alert('Please fill in all fields.');
        return;
      }

      // Finally, get the post Id from the invisible input element.
      const postId = document.getElementById('post-id').value
      
      const commentData = {
        postId: postId,
        name: name,
        comment: comment,
        honeypot: honeypot
      };
  
      try {
        const response = await fetch('https://api.technovi.net/api/newComment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(commentData)
        });
  
        if (!response.ok) {
          throw new Error('Failed to send comment.');
        }
  
        alert('Comment submitted successfully!');
        form.reset();
      } catch (error) {
        console.error('Error:', error);
        alert('There was an error submitting your comment. Please try again.');
      }
    });
  });
  