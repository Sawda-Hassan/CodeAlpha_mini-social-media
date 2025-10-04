// ------------------------------
// CONFIGURATION
// ------------------------------
const API_BASE_URL = "http://localhost:4000/api"; // Change if your backend port is different

// ------------------------------
// TOKEN MANAGEMENT
// ------------------------------
function getToken() {
  return localStorage.getItem("token");
}

function setToken(token) {
  localStorage.setItem("token", token);
}

function removeToken() {
  localStorage.removeItem("token");
}

function getUserFromToken() {
  const token = getToken();
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
}

// ------------------------------
// AUTH CHECK
// ------------------------------
function checkAuth() {
  const token = getToken();
  if (!token) {
    window.location.href = "index.html";
    return false;
  }
  return true;
}

// ------------------------------
// API HELPER
// ------------------------------
async function apiRequest(endpoint, method = "GET", body = null) {
  const token = getToken();
  const headers = { "Content-Type": "application/json" };

  if (token) headers["Authorization"] = `Bearer ${token}`;

  const config = { method, headers };
  if (body) config.body = JSON.stringify(body);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data.message || "An error occurred" };
    }
    return { success: true, data };
  } catch (error) {
    console.error("API Error:", error);
    return { success: false, error: "Network error. Please check your connection." };
  }
}

// ------------------------------
// AUTH FUNCTIONS
// ------------------------------
async function register(username, email, password, bio = "") {
  const result = await apiRequest("/auth/register", "POST", { username, email, password, bio });
  if (result.success && result.data.token) setToken(result.data.token);
  return result;
}

async function login(email, password) {
  const result = await apiRequest("/auth/login", "POST", { email, password });
  if (result.success && result.data.token) setToken(result.data.token);
  return result;
}

function logout() {
  removeToken();
  window.location.href = "index.html";
}

// ------------------------------
// PROFILE FUNCTIONS
// ------------------------------
async function getProfile() {
  const user = getUserFromToken();
  if (!user) return null;

  const result = await apiRequest(`/auth/profile/${user.id}`, "GET");
  return result.success ? result.data : null;
}

async function updateProfile(username, bio, password) {
  const user = getUserFromToken();
  if (!user) return { success: false, error: "Not logged in" };

  const updateData = { displayName: username, bio };
  if (password) updateData.password = password;

  return await apiRequest(`/auth/profile/${user.id}`, "PUT", updateData);
}

// ------------------------------
// POSTS FUNCTIONS
// ------------------------------
async function getPosts() {
  const result = await apiRequest("/posts", "GET");
  return result.success ? result.data : [];
}

async function createPost(content) {
  return await apiRequest("/posts", "POST", { content });
}

async function getPost(postId) {
  const result = await apiRequest(`/posts/${postId}`, "GET");
  return result.success ? result.data : null;
}

// ------------------------------
// COMMENTS FUNCTIONS
// ------------------------------
async function getComments(postId) {
  const result = await apiRequest(`/comments/${postId}`, "GET");
  return result.success ? result.data : [];
}

async function createComment(postId, content) {
  return await apiRequest("/comments", "POST", { postId, content });
}

// ------------------------------
// FOLLOW FUNCTIONS
// ------------------------------
async function followUser(userId) {
  return await apiRequest("/follow", "POST", { userId });
}

async function unfollowUser(userId) {
  return await apiRequest(`/follow/${userId}`, "DELETE");
}

async function getFollowers(userId) {
  const result = await apiRequest(`/follow/followers/${userId}`, "GET");
  return result.success ? result.data : [];
}

async function getFollowing(userId) {
  const result = await apiRequest(`/follow/following/${userId}`, "GET");
  return result.success ? result.data : [];
}

// ------------------------------
// EXPORT FUNCTIONS TO WINDOW
// ------------------------------
window.login = login;
window.register = register;
window.logout = logout;
window.checkAuth = checkAuth;
window.getProfile = getProfile;
window.updateProfile = updateProfile;
window.getPosts = getPosts;
window.createPost = createPost;
window.getPost = getPost;
window.getComments = getComments;
window.createComment = createComment;
window.followUser = followUser;
window.unfollowUser = unfollowUser;
window.getFollowers = getFollowers;
window.getFollowing = getFollowing;
