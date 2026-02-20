// Call authentication function, load contacts, and set up event listeners when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function () {

    checkAuthentication();
    loadAllContacts();
    setupEventListeners();
});

let allContacts = [];

// Check if user is authenticated by looking for a token in sessionStorage
function checkAuthentication() {
    const token = sessionStorage.getItem('userId');
    if (!token) {
        window.location.href = "./index.html";
        return;
    }
}

// Set up event listeners for search input, filter select, and add contact button
function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function (event) {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                handleSearch(event);
            }, 300);
        });
    }

    const filterSelect = document.querySelector('.filter-select');
    if (filterSelect) {
        filterSelect.addEventListener('change', handleFilter);
    }

    const addButton = document.getElementById('addContactBtn');
    if (addButton) {
        addButton.addEventListener('click', showAddContactModal);
    }
}

// Call search API with the search term and update the contact list based on the response
async function handleSearch(event) {
    const searchTerm = event.target.value.trim();

    try {
        showLoadingState();

        const response = await fetch(`../api/searchContacts.php?q=${encodeURIComponent(searchTerm)}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + sessionStorage.getItem('userId')
            }
        });

        const data = await response.json();

        if (data.success) {
            displayContacts(data.contacts);
        } else {
            showMessage('Search failed', 'error');
        }
    } catch (error) {
        console.error('Error searching contacts:', error);
        showMessage('Error searching contacts', 'error');
    } finally {
        hideLoadingState();
    }
}

// Load all contacts for the authenticated user by calling the search API with an empty query and update the contact list based on the response
async function loadAllContacts() {
    try {
        showLoadingState();

        const userId = sessionStorage.getItem('userId');
        if (!userId) {
            console.error('No userId in session');
            window.location.href = './index.html';
            return;
        }
        const response = await fetch(`/api/searchContacts.php?userId=${userId}&q=`, {
            method: 'GET'
        });

        const data = await response.json();

        if (data.success) {
            allContacts = data.contacts;
            displayContacts(allContacts);
        } else {
            showMessage('Failed to load contacts', 'error');
        }
    } catch (error) {
        console.error('Error loading contacts:', error);
        showMessage('Error loading contacts', 'error');
    } finally {
        hideLoadingState();
    }
}

// Convert UTC date string from the database to a more readable local date format
function convertToLocalDate(utc) {
    if (!utc) return 'N/A';

    const formatDate = utc.replace(' ', 'T');
    const date = new Date(formatDate + "Z");
    
    return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
}

// Display the list of contacts in the table, showing a message if no contacts are found
function displayContacts(contacts) {
    const tbody = document.querySelector('.contact-table tbody');

    if (!tbody) return;

    if (contacts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px;">
                    No contacts found. Add your first contact!
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = contacts.map(contact => `
        <tr data-contact-id="${contact.id}">
            <td>${escapeHtml(contact.first_name + ' ' + (contact.last_name || ''))}</td>
            <td>${escapeHtml(contact.phone || 'N/A')}</td>
            <td>${escapeHtml(contact.email || 'N/A')}</td>
            <td>${escapeHtml(convertToLocalDate(contact.created_at))}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="viewContact(${contact.id})">View</button>
                <button class="btn btn-sm btn-secondary" onclick="editContact(${contact.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteContact(${contact.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Call search API with the search term and update the contact list based on the response
async function handleSearch(event) {
    const searchTerm = event.target.value.trim();

    try {
        showLoadingState();

        const userId = sessionStorage.getItem('userId');
        if (!userId) {
            window.location.href = './index.html';
            return;
        }

        const response = await fetch(`/api/searchContacts.php?userId=${userId}&q=${encodeURIComponent(searchTerm)}`, {
            method: 'GET'
        });

        const data = await response.json();

        if (data.success) {
            allContacts = data.contacts;
            displayContacts(data.contacts);
        } else {
            showMessage('Search failed', 'error');
        }
    } catch (error) {
        console.error('Error searching contacts:', error);
        showMessage('Error searching contacts', 'error');
    } finally {
        hideLoadingState();
    }
}

// Show a modal form to add a new contact, which will call the addContact function on submit
function showAddContactModal() {
    const modal = createContactModal('Add New Contact', {});
    document.body.appendChild(modal);
    modal.style.display = 'block';
}

// Create a modal form for adding or editing a contact, pre-filling the form fields if a contact object is provided
function createContactModal(title, contact = {}) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="close-btn" onclick="closeModal()">&times;</button>
            </div>
            <form id="contactForm">
                <div class="form-group">
                    <label>First Name *</label>
                    <input type="text" name="first_name" value="${contact.first_name || ''}" required>
                </div>
                <div class="form-group">
                    <label>Last Name</label>
                    <input type="text" name="last_name" value="${contact.last_name || ''}">
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" name="email" pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$" value="${contact.email || ''}">
                </div>
                <div class="form-group">
                    <label>Phone</label>
                    <input type="tel" name="phone" value="${contact.phone || ''}">
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">
                        ${contact.id ? 'Update' : 'Add'} Contact
                    </button>
                </div>
            </form>
        </div>
    `;

    // Add event listener to the form submit event to call either addContact or updateContact based on whether a contact ID is present
    modal.querySelector('form').addEventListener('submit', (e) => {
        e.preventDefault();
        if (contact.id) {
            updateContact(contact.id, new FormData(e.target));
        } else {
            addContact(new FormData(e.target));
        }
    });

    return modal;
}

// Call add contact API with the form data and update the contact list based on the response, showing a success or error message accordingly
async function addContact(formData) {
    try {
        const userId = sessionStorage.getItem('userId');
        if (!userId) {
            showMessage('Session expired. Please login again.', 'error');
            window.location.href = './index.html';
            return;
        }

        const contactData = {
            first_name: formData.get('first_name'),
            last_name: formData.get('last_name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            company: formData.get('company'),
            notes: formData.get('notes'),
            user_id: parseInt(userId)
        };

        const response = await fetch('/api/addContact.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contactData)
        });

        const data = await response.json();

        if (data.success) {
            showMessage('Contact added successfully!', 'success');
            closeModal();
            loadAllContacts();
            //loadDashboardStats();
        } else {
            showMessage(data.message || 'Failed to add contact', 'error');
        }
    } catch (error) {
        console.error('Error adding contact:', error);
        showMessage('Error adding contact', 'error');
    }
}

// Show a modal with the contact details, allowing the user to view and edit the contact information
async function viewContact(contactId) {
    try {
        const contact = allContacts.find(c => c.id === contactId);

        if (!contact) {
            showMessage('Contact not found', 'error');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Contact Details</h3>
                    <button class="close-btn" onclick="closeModal()">&times;</button>
                </div>
                <div class="contact-details">
                    <p><strong>Name:</strong> ${escapeHtml(contact.first_name + ' ' + (contact.last_name || ''))}</p>
                    <p><strong>Email:</strong> ${escapeHtml(contact.email || 'N/A')}</p>
                    <p><strong>Phone:</strong> ${escapeHtml(contact.phone || 'N/A')}</p>
                    <p><strong>Date Created:</strong> ${escapeHtml(convertToLocalDate(contact.created_at) || 'N/A')}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal()">Close</button>
                    <button class="btn btn-primary" onclick="closeModal(); editContact(${contactId})">Edit</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'block';
    } catch (error) {
        console.error('Error viewing contact:', error);
        showMessage('Error loading contact details', 'error');
    }
}

// Show a modal form to edit an existing contact, pre-filling the form fields with the contact's current information
async function editContact(contactId) {
    try {
        const contact = allContacts.find(c => c.id === contactId);

        if (!contact) {
            showMessage('Contact not found', 'error');
            return;
        }

        const modal = createContactModal('Edit Contact', contact);
        document.body.appendChild(modal);
        modal.style.display = 'block';
    } catch (error) {
        console.error('Error loading contact for edit:', error);
        showMessage('Error loading contact', 'error');
    }
}

// Call update contact API with the form data and update the contact list based on the response, showing a success or error message accordingly
async function updateContact(contactId, formData) {
    try {
        const contactData = {
            id: contactId,
            first_name: formData.get('first_name'),
            last_name: formData.get('last_name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            company: formData.get('company'),
            notes: formData.get('notes'),
        };

        const response = await fetch('../api/updateContact.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + sessionStorage.getItem('userId')
            },
            body: JSON.stringify(contactData)
        });

        const data = await response.json();

        if (data.success) {
            showMessage('Contact updated successfully!', 'success');
            closeModal();
            loadAllContacts();
        } else {
            showMessage(data.message || 'Failed to update contact', 'error');
        }
    } catch (error) {
        console.error('Error updating contact:', error);
        showMessage('Error updating contact', 'error');
    }
}

// Show a confirmation dialog before deleting a contact, and call the delete API if the user confirms
function deleteContact(contactId) {
    if (!confirm(`Are you sure you want to delete this contact?`)) {
        return;
    }

    performDelete(contactId);
}

// Call delete contact API with the contact ID and update the contact list based on the response, showing a success or error message accordingly
async function performDelete(contactId) {
    try {
        const userId = sessionStorage.getItem('userId');

        const response = await fetch('/api/deleteContact.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contactid: contactId,
                userid: parseInt(userId)
            })
        });

        const data = await response.json();

        if (data.success) {
            showMessage('Contact deleted successfully!', 'success');
            loadAllContacts();
        } else {
            showMessage(data.error || 'Failed to delete contact', 'error');
        }
    } catch (error) {
        console.error('Error deleting contact:', error);
        showMessage('Error deleting contact', 'error');
    }
}

// Remove the modal from the DOM to close it
function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

// Show a loading spinner in the contact table while contacts are being fetched from the API
function showLoadingState() {
    const tbody = document.querySelector('.contact-table tbody');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px;">
                    <div class="spinner"></div>
                    Loading contacts...
                </td>
            </tr>
        `;
    }
}

function hideLoadingState() {
    // Loading state will be replaced by actual data
}
 
// Escape HTML special characters to prevent XSS attacks when displaying user-generated content
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, m => map[m]);
}

// Display a temporary message on the screen, styled differently based on whether it's a success or error message, and automatically hide it after a few seconds
function showMessage(message, type) {

    const existingMessage = document.querySelector('.alert-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `alert-message alert-${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 6px;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        ${type === 'error'
            ? 'background-color: #fee; color: #c00; border: 1px solid #fcc;'
            : 'background-color: #efe; color: #060; border: 1px solid #cfc;'}
    `;

    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => messageDiv.remove(), 300);
    }, 5000);
}

// Clear session storage and redirect to the login page when the user clicks the logout button
function logout() {
    sessionStorage.clear();
    window.location.href = './index.html';
}
