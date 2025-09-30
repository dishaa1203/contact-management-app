const API_URL = "http://localhost:5001/api";
let token = null;

// ====== UTILITIES ======
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

function validatePhone(phone) {
  // Only numbers, exactly 10 digits
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
}

function showToast(message, type = "info") {
  let bgColor;

  switch (type) {
    case "success":
      bgColor = "linear-gradient(to right, #00b09b, #96c93d)";
      break;
    case "error":
      bgColor = "linear-gradient(to right, #e52d27, #b31217)";
      break;
    case "warning":
      bgColor = "linear-gradient(to right, #f7971e, #ffd200)";
      break;
    default:
      bgColor = "linear-gradient(to right, #00c6ff, #0072ff)";
  }

  Toastify({
    text: message,
    duration: 3000,
    close: true,
    gravity: "top",
    position: "right",
    backgroundColor: bgColor,
  }).showToast();
}

// ====== CUSTOM ALERT CONFIRM ======
function showConfirm(message) {
  return new Promise((resolve) => {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'custom-alert';
    alertDiv.innerHTML = `
      <div class="custom-alert-content">
        <h3>Confirm Action</h3>
        <p>${message}</p>
        <div class="custom-alert-buttons">
          <button class="cancel-btn" onclick="this.closest('.custom-alert').remove(); resolve(false)">Cancel</button>
          <button class="confirm-btn" onclick="this.closest('.custom-alert').remove(); resolve(true)">Confirm</button>
        </div>
      </div>
    `;
    document.body.appendChild(alertDiv);
  });
}

// ====== SHOW SECTIONS ======
function showSection(sectionId) {
  document.getElementById("landing-page").style.display = "none";
  document.querySelectorAll(".auth-section").forEach(sec => sec.style.display = "none");
  document.getElementById("contact-section").style.display = "none";

  document.getElementById(sectionId).style.display = "block";
}

// ====== REGISTER ======
async function register() {
  const name = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value.trim();

  if (!name || !email || !password) {
    showToast("All fields are required!", "warning");
    return;
  }
  if (!isValidEmail(email)) {
    showToast("Please enter a valid email address.", "error");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: name, email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      showToast(data.message || "Registration failed", "error");
      return;
    }

    showToast("Registration successful! Please login.", "success");
    showSection("login-section");
    
    // Clear form
    document.getElementById("regName").value = "";
    document.getElementById("regEmail").value = "";
    document.getElementById("regPassword").value = "";
  } catch (err) {
    console.error("Error registering:", err);
    showToast("Error registering.", "error");
  }
}

// ====== LOGIN ======
async function login() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  if (!email || !password) {
    showToast("All fields are required!", "warning");
    return;
  }
  if (!isValidEmail(email)) {
    showToast("Please enter a valid email address.", "error");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      showToast(data.message || "Invalid credentials", "error");
      return;
    }

    token = data.accessToken;

    // Fetch user info using /current
    const userRes = await fetch(`${API_URL}/users/current`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const user = await userRes.json();

    document.getElementById("username").textContent = user.username;
    document.getElementById("useremail").textContent = user.email;

    showToast(`Welcome back, ${user.username}! 👋`, "success");
    showSection("contact-section");
    getContacts();
    
    // Clear form
    document.getElementById("loginEmail").value = "";
    document.getElementById("loginPassword").value = "";
  } catch (err) {
    console.error("Error logging in:", err);
    showToast("Login failed.", "error");
  }
}

// ====== LOGOUT ======
function logout() {
  token = null;
  showToast("Logged out successfully!", "success");
  showSection("landing-page");
}

// ====== GET CONTACTS ======
async function getContacts() {
  try {
    const res = await fetch(`${API_URL}/contacts`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch contacts");

    const contacts = await res.json();
    window.allContacts = contacts;
    renderContacts(contacts);
  } catch (err) {
    console.error("Error loading contacts:", err);
    showToast("Failed to load contacts.", "error");
  }
}

// ====== RENDER CONTACTS ======
function renderContacts(contacts) {
  const list = document.getElementById("contact-list");
  list.innerHTML = "";

  if (contacts.length === 0) {
    list.innerHTML = `
      <li class="no-contacts">
        <div>📝</div>
        <p>No contacts found. Add your first contact!</p>
      </li>
    `;
    return;
  }

  contacts.forEach(c => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="contact-info">
        <strong>${c.name}</strong>
        <span>📧 ${c.email}</span>
        <span>📱 ${c.phone}</span>
      </div>
      <div class="contact-actions">
        <button onclick="editContact('${c._id}')">Edit</button>
        <button onclick="deleteContact('${c._id}')">Delete</button>
      </div>
    `;
    list.appendChild(li);
  });
}

// ====== CHECK FOR DUPLICATE CONTACT ======
function checkDuplicateContact(id, name, email, phone) {
  return window.allContacts.find(contact => {
    // Skip the current contact being edited
    if (id && contact._id === id) return false;
    
    // Check for duplicates by email OR phone
    const isDuplicateEmail = contact.email.toLowerCase() === email.toLowerCase();
    const isDuplicatePhone = contact.phone === phone;
    const isDuplicateName = contact.name.toLowerCase() === name.toLowerCase();
    
    return isDuplicateEmail || isDuplicatePhone || isDuplicateName;
  });
}

// ====== ADD / UPDATE CONTACT ======
async function addOrUpdateContact() {
  const id = document.getElementById("contactId").value;
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("contactPhone").value.trim();

  if (!name || !email || !phone) {
    showToast("All fields are required!", "warning");
    return;
  }
  if (!isValidEmail(email)) {
    showToast("Please enter a valid email address for contact.", "error");
    return;
  }
  if (!validatePhone(phone)) {
    showToast("Please enter a valid 10-digit phone number.", "error");
    return;
  }

  // Check for duplicate contacts (both for new and existing contacts)
  const duplicateContact = checkDuplicateContact(id, name, email, phone);
  
  if (duplicateContact) {
    let errorMessage = "Contact with ";
    const issues = [];
    
    if (duplicateContact.name.toLowerCase() === name.toLowerCase()) {
      issues.push("same name");
    }
    if (duplicateContact.email.toLowerCase() === email.toLowerCase()) {
      issues.push("same email");
    }
    if (duplicateContact.phone === phone) {
      issues.push("same phone number");
    }
    
    errorMessage += issues.join(" and ") + " already exists!";
    showToast(errorMessage, "error");
    return;
  }

  const contactData = { name, email, phone };

  try {
    let res;
    if (id) {
      res = await fetch(`${API_URL}/contacts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(contactData),
      });
    } else {
      res = await fetch(`${API_URL}/contacts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(contactData),
      });
    }

    const responseData = await res.json();
    
    if (!res.ok) {
      showToast(responseData.message || "Save failed", "error");
      return;
    }

    // Reset form
    document.getElementById("contactId").value = "";
    document.getElementById("name").value = "";
    document.getElementById("email").value = "";
    document.getElementById("contactPhone").value = "";
    document.getElementById("form-title").textContent = "Add New Contact";
    document.getElementById("submitBtn").textContent = "Add Contact";

    showToast(id ? "Contact updated successfully!" : "Contact saved successfully!", "success");
    getContacts();
  } catch (err) {
    console.error("Error saving contact:", err);
    showToast("Failed to save contact.", "error");
  }
}

// ====== EDIT CONTACT ======
function editContact(id) {
  const c = window.allContacts.find(ct => ct._id === id);
  if (c) {
    document.getElementById("contactId").value = c._id;
    document.getElementById("name").value = c.name;
    document.getElementById("email").value = c.email;
    document.getElementById("contactPhone").value = c.phone;
    document.getElementById("form-title").textContent = "Edit Contact";
    document.getElementById("submitBtn").textContent = "Update Contact";
    
    // Scroll to form
    document.getElementById('name').scrollIntoView({ behavior: 'smooth' });
  }
}

// ====== DELETE CONTACT ======
async function deleteContact(id) {
  console.log("Attempting to delete contact:", id);
  
  const confirmed = await showConfirm("Are you sure you want to delete this contact?");
  if (!confirmed) {
    console.log("Delete cancelled by user");
    return;
  }
  
  try {
    const res = await fetch(`${API_URL}/contacts/${id}`, {
      method: "DELETE",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}` 
      },
    });

    console.log("Delete response status:", res.status);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: "Unknown error" }));
      console.error("Delete failed:", errorData);
      throw new Error(errorData.message || "Failed to delete contact");
    }

    showToast("Contact deleted successfully!", "success");
    
    // Remove from local array and re-render
    window.allContacts = window.allContacts.filter(contact => contact._id !== id);
    renderContacts(window.allContacts);
    
  } catch (err) {
    console.error("Error deleting contact:", err);
    showToast(err.message || "Failed to delete contact.", "error");
  }
}

// ====== SEARCH CONTACTS ======
function searchContacts() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const filtered = window.allContacts.filter(
    c =>
      c.name.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      c.phone.toLowerCase().includes(query)
  );
  renderContacts(filtered);
}

// ====== ENTER KEY SUPPORT ======
function handleKeyPress(event, action) {
  if (event.key === 'Enter') {
    event.preventDefault();
    if (action === 'register') register();
    if (action === 'login') login();
    if (action === 'addContact') addOrUpdateContact();
  }
}

// ====== FORCE LANDING PAGE ON RELOAD ======
window.onload = () => {
  token = null;
  showSection("landing-page");
};

// ====== CANCEL EDIT ======
function cancelEdit() {
  document.getElementById("contactId").value = "";
  document.getElementById("name").value = "";
  document.getElementById("email").value = "";
  document.getElementById("contactPhone").value = "";
  document.getElementById("form-title").textContent = "Add New Contact";
  document.getElementById("submitBtn").textContent = "Add Contact";
  showToast("Edit cancelled", "info");
}