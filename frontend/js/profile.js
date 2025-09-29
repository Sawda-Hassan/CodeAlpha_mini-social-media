// Profile page functionality
class Profile {
  constructor() {
    this.init()
  }

  init() {
    // Check authentication
    if (!window.auth.requireAuth()) return

    this.loadProfile()
    this.loadUserPosts()
  }

  loadProfile() {
    const currentUser = window.auth.getCurrentUser()
    if (!currentUser) return

    // Update profile info
    document.getElementById("profile-username").textContent = currentUser.username
    document.getElementById("profile-avatar").textContent = currentUser.username.charAt(0).toUpperCase()

    // Calculate stats
    const userPosts = window.app.getUserPosts(currentUser.username)
    const totalLikes = userPosts.reduce((sum, post) => sum + post.likeCount, 0)

    document.getElementById("posts-count").textContent = userPosts.length
    document.getElementById("likes-count").textContent = totalLikes
  }

  loadUserPosts() {
    const currentUser = window.auth.getCurrentUser()
    if (!currentUser) return

    const userPosts = window.app.getUserPosts(currentUser.username)
    const container = document.getElementById("user-posts-container")

    if (userPosts.length === 0) {
      container.innerHTML =
        '<div class="no-posts">You haven\'t posted anything yet. <a href="post.html">Create your first post!</a></div>'
      return
    }

    container.innerHTML = userPosts.map((post) => window.app.renderPost(post, true)).join("")
  }
}

// Global refresh function for posts
window.refreshPosts = () => {
  if (window.profileInstance) {
    window.profileInstance.loadProfile()
    window.profileInstance.loadUserPosts()
  }
}

// Initialize profile when page loads
document.addEventListener("DOMContentLoaded", () => {
  window.profileInstance = new Profile()
})
