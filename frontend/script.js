async function fetchPosts() {
  const res = await fetch('http://localhost:5000/api/posts');
  const posts = await res.json();
  const postsDiv = document.getElementById('posts');
  postsDiv.innerHTML = '';

  posts.forEach(post => {
    const postEl = document.createElement('div');
    postEl.className = 'post';
    postEl.innerHTML = `
      <h3>${post.author.username}</h3>
      <p>${post.content}</p>
      <p>Likes: ${post.likes.length}</p>
      <button onclick="likePost('${post._id}')">Like/Unlike</button>
    `;
    postsDiv.appendChild(postEl);
  });
}

async function likePost(postId) {
  await fetch(`http://localhost:5000/api/posts/${postId}/like`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: 'yourUserIdHere' }) 
  });
  fetchPosts();
}

fetchPosts();
