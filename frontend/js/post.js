// Post creation functionality
class PostCreator {
  constructor() {
    this.init()
  }

  init() {
    // Check authentication
    if (!window.auth.requireAuth()) return

    this.setupEventListeners()
    this.updateCharCount()
  }

  setupEventListeners() {
    const form = document.getElementById("create-post-form")
    const textarea = document.getElementById("post-content")

    if (form) {
      form.addEventListener("submit", (e) => this.handleSubmit(e))
    }

    if (textarea) {
      textarea.addEventListener("input", () => this.updateCharCount())
    }
  }

  updateCharCount() {
    const textarea = document.getElementById("post-content")
    const charCount = document.getElementById("char-count")

    if (textarea && charCount) {
      charCount.textContent = textarea.value.length

      // Change color based on character count
      if (textarea.value.length > 450) {
        charCount.style.color = "#e53e3e"
      } else if (textarea.value.length > 400) {
        charCount.style.color = "#dd6b20"
      } else {
        charCount.style.color = "#666"
      }
    }
  }

  handleSubmit(e) {
    e.preventDefault()

    const content = document.getElementById("post-content").value.trim()
    const currentUser = window.auth.getCurrentUser()

    if (!content) {
      alert("Please write something before posting!")
      return
    }

    if (content.length > 500) {
      alert("Post is too long! Maximum 500 characters allowed.")
      return
    }

    // Create the post
    window.app.createPost(content, currentUser.username)

    // Show success message
    alert("Post created successfully!")

    // Clear form and redirect to home
    document.getElementById("post-content").value = ""
    this.updateCharCount()

    // Redirect to home page after a short delay
    setTimeout(() => {
      window.location.href = "index.html"
    }, 1000)
  }
}

// Initialize post creator when page loads
document.addEventListener("DOMContentLoaded", () => {
  new PostCreator()
})
