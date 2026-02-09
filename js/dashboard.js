
//Loads dashboard data
document.addEventListener('DOMContentLoaded', function() {
    
    //checkAuthentication();
    
    loadDashboardStats();
    loadAllContacts();
    //loadGroups();
    
    setupEventListeners();
});

/*function checkAuthentication() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = "./index.html";
        return;
    }
}*/

function setupEventListeners() {

    //Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input',handleSearch);
    }

    const filterSelect = document.querySelector('.filter-select');
    if (filterSelect) {
        filterSelect.addEventListener('change',handleFilter);
    }

    const addButton = document.getElementById('addContactBtn');
    if (addButton) {
        addButton.addEventListener('click', showAddContactModal);
    }
}

//Load dashboard stats function
function loadDashboardStats() {
    // Placeholder for fetching stats from backend
}
    

//update stats on the dashboard
function updateDashboardStats(stats) {
    // Update the dashboard stats section with the provided data
    }


async function loadAllContacts() {
    // Show loading state
}

//Display contacts
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
            <td>${escapeHtml(contact.group_name || 'None')}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="viewContact(${contact.id})">View</button>
                <button class="btn btn-sm btn-secondary" onclick="editContact(${contact.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteContact(${contact.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

//Search contacts
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    
    const filteredContacts = allContacts.filter(contact => {
        const fullName = (contact.first_name + ' ' + (contact.last_name || '')).toLowerCase();
        const phone = (contact.phone || '').toLowerCase();
        const email = (contact.email || '').toLowerCase();
        
        return fullName.includes(searchTerm) || 
               phone.includes(searchTerm) || 
               email.includes(searchTerm);
    });
    
    displayContacts(filteredContacts);
}


//Add new contact modal
function showAddContactModal() {
    const modal = createContactModal('Add New Contact', {});
    document.body.appendChild(modal);
    modal.style.display = 'block';
}

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
                <div class="form-group">
                    <label>Company</label>
                    <input type="text" name="company" value="${contact.company || ''}">
                </div>
                <div class="form-group">
                    <label>Notes</label>
                    <textarea name="notes" rows="3">${contact.notes || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" name="is_favorite" ${contact.is_favorite ? 'checked' : ''}>
                        Add to Favorites
                    </label>
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
        // Handle form submission
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

async function addContact(formData) {
   // Placeholder for adding contact to backend
}

//View Contact Details
function viewContact(contactId) {
    const contact = allContacts.find(c => c.id === contactId);
    
    if (!contact) return;
    
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
                <p><strong>Company:</strong> ${escapeHtml(contact.company || 'N/A')}</p>
                <p><strong>Group:</strong> ${escapeHtml(contact.group_name || 'None')}</p>
                <p><strong>Notes:</strong> ${escapeHtml(contact.notes || 'N/A')}</p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">Close</button>
                <button class="btn btn-primary" onclick="closeModal(); editContact(${contactId})">Edit</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
}

//edit Contact
function editContact(contactId) {
    const contact = allContacts.find(c => c.id === contactId);
    
    if (!contact) return;
    
    const modal = createContactModal('Edit Contact', contact);
    document.body.appendChild(modal);
    modal.style.display = 'block';
}

async function updateContact(contactId, formData) {
   // Placeholder for updating contact in backend
}


// Delete Contact
function deleteContact(contactId) {
    const contact = allContacts.find(c => c.id === contactId);
    
    if (!contact) return;
    
    if (!confirm(`Are you sure you want to delete ${contact.first_name} ${contact.last_name || ''}?`)) {
        return;
    }
    
    performDelete(contactId);
}

async function performDelete(contactId) {
// Placeholder for deleting contact from backend
}

// Helper Functions
function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

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

function showMessage(message, type) {
    // Remove existing message
    const existingMessage = document.querySelector('.alert-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create message element
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
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => messageDiv.remove(), 300);
    }, 5000);
}

// Logout Function
function logout() {
    localStorage.removeItem('authToken');
    window.location.href = '../index.html';
}