

document.addEventListener('DOMContentLoaded', function() {
    
    checkAuthentication();
    loadAllContacts();
    setupEventListeners();
});

let allContacts = [];

function checkAuthentication() {
    const token = sessionStorage.getItem('userId');
    if (!token) {
        window.location.href = "./index.html";
        return;
    }
}

function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function(event) {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                handleSearch(event);
            }, 300);
        });
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
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">
                        ${contact.id ? 'Update' : 'Add'} Contact
                    </button>
                </div>
            </form>
        </div>
    `;
        
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


function deleteContact(contactId) {
    if (!confirm(`Are you sure you want to delete this contact?`)) {
        return;
    }
    
    performDelete(contactId);
}

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

function logout() {
    sessionStorage.clear();
    window.location.href = './index.html';
}