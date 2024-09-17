function displayComments(post) {
    const commentContainer = document.getElementById(`comments-${post.id}`);
    if (commentContainer) {
        commentContainer.innerHTML = ''; 

        post.comments.forEach(comment => {
            const commentElement = document.createElement('p');
            commentElement.innerHTML = `<strong>${comment.user}:</strong> ${comment.comment}`;
            commentContainer.appendChild(commentElement);
        });
    }
}

async function fetchPosts() {
    try {
        const response = await fetch('api.php?action=read');
        const posts = await response.json();

        const postContainer = document.getElementById('post-container');
        postContainer.innerHTML = ''; 

        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.innerHTML = `
                <strong>"${post.text}"</strong>
                <a>oleh ${post.uploader}</a>
                <p>Likes: ${post.likes} | Dislikes: ${post.dislikes} | ${post.date}</p>
                <button class="like-btn" onclick="likePost(${post.id})">Like</button>
                <button class="dislike-btn" onclick="dislikePost(${post.id})">Dislike</button>
                <button class="delete-btn" onclick="deletePost(${post.id})">Delete</button>
                <div id="comments-${post.id}"></div>
                <div>
                    <input type="text" placeholder="Komentar" id="comment-text-${post.id}">
                    <button onclick="addComment(${post.id})">Tambah Komentar</button>
                </div>
                <hr>
            `;
            postContainer.appendChild(postElement);

            displayComments(post);
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
    }
}

async function addComment(postId) {
    const commenter = "Anonymous";
    const commentText = document.getElementById(`comment-text-${postId}`).value;

    if (commenter && commentText) {
        try {
            await fetch('api.php?action=addComment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postId, commenter, commentText })
            });

            fetchPosts();
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    }
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const today = new Date();

async function uploadPost() {
    const text = document.getElementById('post-text').value;
    const uploader = document.getElementById('uploader-name').value;
    const Info = document.getElementById('logs');
    const date = formatDate(today);
    
    try {
        const response = await fetch('api.php?action=create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, uploader, date })
        });

        if (response.ok) {
            window.location.href = 'index.html';
            Info.innerHTML = 'Berhasil di Unggah!';
            fetchPosts();
        } else {
            Info.innerHTML = 'Gagal mengunggah post.';
        }
    } catch (error) {
        Info.innerHTML = 'Terjadi kesalahan: ' + error.message;
    }
}

async function likePost(postId) {
    try {
        await fetch(`api.php?action=like&id=${postId}`);
        fetchPosts();
    } catch (error) {
        console.error('Error liking post:', error);
    }
}

async function dislikePost(postId) {
    try {
        await fetch(`api.php?action=dislike&id=${postId}`);
        fetchPosts();
    } catch (error) {
        console.error('Error disliking post:', error);
    }
}

async function deletePost(postId) {
    try {
        await fetch(`api.php?action=delete&id=${postId}`);
        fetchPosts();
    } catch (error) {
        console.error('Error deleting post:', error);
    }
}

fetchPosts();
