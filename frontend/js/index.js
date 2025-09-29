// Main application initialization
document.addEventListener("DOMContentLoaded", () => {
  // Initialize all managers
  window.auth = new window.Auth()
  window.postManager = new window.PostManager()
  window.profileManager = new window.ProfileManager()
  window.app = new window.App()

  console.log("Mini Social Media App initialized successfully!")

  // Add some demo data if no posts exist
  if (window.postManager.getPosts().length === 0) {
    // You can uncomment this to add demo posts
    // addDemoData();
  }
})

// Optional: Add demo data for testing
function addDemoData() {
  const demoPosts = [
    {
      id: 1,
      content: "Welcome to Mini Social! 🎉 This is your first post. Start sharing your thoughts!",
      author: "admin",
      authorId: 0,
      timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      likes: [],
      comments: [],
    },
    {
      id: 2,
      content: "Beautiful sunset today! 🌅 Nature never fails to amaze me.",
      author: "demo_user",
      authorId: 1,
      timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
      likes: [],
      comments: [],
    },
  ]

  localStorage.setItem("posts", JSON.stringify(demoPosts))
  window.postManager.posts = demoPosts
}

// Global utility functions
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString() + " " + date.toLocaleTimeString()
}

function sanitizeInput(input) {
  const div = document.createElement("div")
  div.textContent = input
  return div.innerHTML
}

// Declare the variables before using them
window.Auth = class Auth {}
window.PostManager = class PostManager {
  getPosts() {
    return JSON.parse(localStorage.getItem("posts")) || []
  }
}
window.ProfileManager = class ProfileManager {}
window.App = class App {}
