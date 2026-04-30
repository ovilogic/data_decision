// Declare function that will create a html section for one blog post.
function articleHTML(id, title, date, content, tags) {

    let parentElement = document.getElementById('articles-space');

    let article = document.createElement('article');
    parentElement.appendChild(article);

    article.className = "col-12 col-md-6 tm-post";

    let hr1 = document.createElement('hr');
    hr1.className = "tm-hr-primary";
    article.appendChild(hr1);

    let a = document.createElement('a');
    // a.href = "post.html";
    a.className = "effect-lily tm-post-link tm-pt-60";

    article.appendChild(a)

        let div1 = document.createElement('div');
        div1.className = "tm-post-link-inner";

        a.appendChild(div1)

        let img = document.createElement('img');
        // TODO: create re-write this image section so that code checks for any uploads to the S3 bucket I will create. The image I upload should be 
        // something like img + [ID]
        img.src = "img/generic23.jpg";
        img.alt = "Image";
        img.className = "img-fluid";
        div1.appendChild(img);

        /* The 'New' tag on top right corner of image. Only add it if it's 
        a recent document, less than 10 days old.
        */
        const today = new Date()
        const dateReconstructed = new Date(date)
        const daysSince = (today - dateReconstructed) / (1000 * 60 * 60 * 24)
        if (daysSince <= 10) {
            let span1 = document.createElement('span');
            span1.className = "position-absolute tm-new-badge";
            span1.textContent = "New";
            a.appendChild(span1);
        }
        
        // Title element. Clickable
        let h2 = document.createElement('h2');
        h2.className = "tm-pt-30 tm-color-primary tm-post-title";
        h2.textContent = title;
        a.appendChild(h2);
        h2.addEventListener('click', function() {
            localStorage.setItem('id', id);
            localStorage.setItem('post_title', title);
            localStorage.setItem('pContent', content);
            localStorage.setItem('pDate', date.slice(0, 10) + ' at ' +
            date.slice(11,19));
            localStorage.setItem('pTags', tags);
            window.location.href = 'post.html';
        });

    // Content section
    let p = document.createElement('p');
    p.className = "tm-pt-30";
    if (content.length < 400) {
        p.innerHTML = content
    } else {
        p.innerHTML = content.slice(0, 400) + ' ...';
    }
    
    article.appendChild(p);

    let div2 = document.createElement('div');
    div2.className = "d-flex justify-content-between tm-pt-45";
    article.appendChild(div2)

    let span2 = document.createElement('span');
    span2.className = "tm-color-primary";
    span2.textContent = tags;
    div2.appendChild(span2);

    // Date element.
    let span3 = document.createElement('span');
    span3.className = "tm-color-gray";
    span3.textContent = date.slice(0, 10) + ' at ' +
    date.slice(11,19);
    div2.appendChild(span3);

    let hr2 = document.createElement('hr');
    article.appendChild(hr2);

    // <div> whose function is to group 'comments count' and 'author'.
    let div3 = document.createElement('div');
    div3.className = "d-flex justify-content-between";
    article.appendChild(div3);

        let span4 = document.createElement('span');
        // TODO: add comments count for post;
        span4.textContent = ' '
        div3.appendChild(span4);

        // Author. Hardcoded.
        let span5 = document.createElement('span');
        span5.textContent = "by Ovi";
        div3.appendChild(span5);

}

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
        let currentPage = 1;
        const postsPerPage = 2;
        const totalPages = Math.ceil(data.length / postsPerPage)

        //Function to render posts for the current page
        function renderPage(pageNumber) {
            // Clear the current content in 'articles-space'
            let parentElement = document.getElementById('articles-space');
            parentElement.innerHTML = '';

            // Calculate the starting and ending indices of the slice
            
            let startIndex = data.length - pageNumber * postsPerPage;
            const endIndex = startIndex + postsPerPage;
            if (startIndex < 0) {
                startIndex = 0;
            }

            // Slice the array and render only the relevant posts
            const postsToRender = data.slice(startIndex, endIndex);

            for (let i = 1; i <= postsToRender.length; i++) {
                // Iterating through array backwards so as to list the most recent posts first.
                const entry = postsToRender[postsToRender.length - i]
               
                articleHTML(entry['id'], entry['Title'], entry['Date_posted'], entry['Content'], entry['Tags']); 
            }

            // Update pagination controls (if needed)
            document.getElementsByClassName("d-inline-block mr-3")[0].textContent = `Page ${pageNumber} of ${totalPages}`;

            // Enable or disable buttons based on the current page
            const prevButton = document.getElementById('prev-btn');
            const nextButton = document.getElementById('next-btn');

            if (pageNumber === 1) {
                prevButton.disabled = true;
                prevButton.classList.add('disabled');
            } else {
                prevButton.disabled = false;
                prevButton.classList.remove('disabled')
            }
            if (pageNumber === totalPages) {
                nextButton.disabled = true;
                nextButton.classList.add('disabled')
            } else {
                nextButton.disabled = false;
                nextButton.classList.remove('disabled')
            }

        }
        // Start off by rendering the first page
        renderPage(currentPage)

        // Event listeners for pagination controls
        document.getElementById('prev-btn').addEventListener('click',
            function() {
                if (currentPage > 1) {
                    currentPage--;
                    renderPage(currentPage)
                }
            }
        )

        document.getElementById('next-btn').addEventListener('click',
            function() {
                if (currentPage < totalPages) {
                    currentPage++;
                    renderPage(currentPage)
                }
            }
        )

        
        
    })
    .catch(error => {
        console.error('Error, mate:', error)
    });

  

