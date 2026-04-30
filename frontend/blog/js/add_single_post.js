const postId = localStorage.getItem('id');
localStorage.removeItem('id');

function singlePost(title, date, content, tags) {
    let parentElement = document.getElementById('parent');
    parentElement.innerHTML = '';

    // The title of the post.
    let h2 = document.createElement('h2');
    h2.className = "pt-2 tm-color-primary tm-post-title";
    h2.textContent = title;
    h2.id = "blog-title"
    parentElement.appendChild(h2);

    // Invisible html input to store the id
    let input = document.createElement('input');
    input.type = 'hidden';
    input.id = 'post-id';
    input.value = postId;
    parentElement.appendChild(input);
    
    
    // The subtitle with date and author.
    let p1 = document.createElement('p');
    p1.className = "tm-mb-40";
    p1.id = "subtitle"
    p1.textContent = date.slice(0, 10) + ' at ' +
    date.slice(11,19) + " posted by Ovi";
    parentElement.appendChild(p1);

    // Content section.
    let p2 = document.createElement('p');
    p2.id = 'postContent';
    p2.innerHTML = content;
    parentElement.appendChild(p2);

    // Tags section.
    let span = document.createElement('span');
    span.className = "d-block text-right tm-color-primary";
    span.id = "postTags";
    span.textContent = tags;
    parentElement.appendChild(span);

}

function apiCall() {
    // Get the array of blog posts from the mysql database.
const apiUrl = 'https://api.technovi.net/api/posts';

fetch(apiUrl)
.then(response => {
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
})
.then(data => {
    const entry = data[data.length - 1]
    singlePost(entry['Title'], entry['Date_posted'], entry['Content'], entry['Tags']); 
    
    var newText = localStorage.getItem('post_title');
    var newDate = localStorage.getItem('pDate');
    var newContent = localStorage.getItem('pContent');
    var newTags = localStorage.getItem('pTags');
    

        if (newText) {
            let new_title = document.getElementById('blog-title')
            let new_subtitle = document.getElementById('subtitle')
            let new_content = document.getElementById('postContent')
            let new_tags = document.getElementById('postTags')

            new_title.textContent = newText
            new_subtitle.textContent = newDate + " posted by Ovi"
            new_content.innerHTML = newContent;
            new_tags.textContent = newTags;
            
            localStorage.removeItem('post_title');  // clear the text from localStorage
            localStorage.removeItem('pContent');
            localStorage.removeItem('pDate');
            localStorage.removeItem('pTags')
            
        }
    
})
.catch(error => {
    console.error('Error, mate:', error)
});
}

function getComments() {
    
    const urlComments = `https://api.technovi.net/api/getComments/${postId}`
    fetch(urlComments)
    .then(response => response.json())
    .then(comments => {
        // Populate with comments
        const commentsContainer = document.getElementById('comments-list');
        commentsContainer.innerHTML = '';
        comments.forEach(comment => {
            const commentElement = document.createElement('div');
            commentElement.classList.add('comment');
            commentElement.innerHTML = `
            <div class="card mb-4">
                <div class="card-body shadow-sm">
                    <h7 class="card-title mb-4 bg-light rounded border">${comment.name}</h7>
                    <p class="card-text">${comment.comment}</p>
                </div>
            </div>`
            commentsContainer.appendChild(commentElement);
        });
    })
    .catch(error => {
        console.log('Error loading comments:', error);

        });
    }

apiCall()
getComments()


