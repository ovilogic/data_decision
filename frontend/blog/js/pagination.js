// Assuming articles is your array of article objects
function countArticleElements() {
    var articles = document.getElementsByTagName('article');
    return articles;
}

var articles = countArticleElements; // Your articles here
var currentPage = 1;
var articlesPerPage = 20;

function showPage(pageNumber) {
    var start = (pageNumber - 1) * articlesPerPage;
    var end = start + articlesPerPage;
    var pageArticles = articles.slice(start, end);

    // Clear out the current display from the page numbers div.
    var container = document.querySelector('.tm-paging-wrapper');
    container.innerHTML = '';

    // Loop through the articles for this page and display them
    pageArticles.forEach(function(article) {
        var articleElement = document.createElement('article');
        articleElement.textContent = article.content;
        container.appendChild(articleElement);
    });

    // Update the active page
    var pagingItems = document.querySelectorAll('.tm-paging-item');
    pagingItems.forEach(function(item, index) {
        if (index === pageNumber - 1) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

function createPagination() {
    var totalPages = Math.ceil(articles.length / articlesPerPage);
    // The <ul> list that holds the page buttons
    var paginationContainer = document.querySelector('.tm-paging-nav ul');

    // Clear out the current pagination
    paginationContainer.innerHTML = '';

    // Create a new pagination button for each page
    for (var i = 1; i <= totalPages; i++) {
        var listItem = document.createElement('li');
        listItem.classList.add('tm-paging-item');

        var link = document.createElement('a');
        link.href = '#';
        link.classList.add('mb-2', 'tm-btn', 'tm-paging-link');
        link.textContent = i;

        // Attach click event to the page link
        link.addEventListener('click', function() {
            currentPage = i;
            showPage(currentPage);
        });

        listItem.appendChild(link);
        paginationContainer.appendChild(listItem);
    }
}

// Attach click events to the prev/next buttons
document.querySelector('.tm-prev-next-wrapper .tm-prev-next').addEventListener('click', function() {
    if (currentPage > 1) {
        currentPage--;
        showPage(currentPage);
    }
});

document.querySelector('.tm-prev-next-wrapper .tm-next').addEventListener('click', function() {
    if (currentPage < Math.ceil(articles.length / articlesPerPage)) {
        currentPage++;
        showPage(currentPage);
    }
});

// Create the pagination and show the first page
createPagination();
showPage(1);
