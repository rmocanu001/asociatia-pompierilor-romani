const API_URL = window.location.origin;

// Navigation
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    
    // Load data when switching to certain sections
    if (sectionId === 'discounts') {
        loadDiscounts();
    }
}

// Member Registration
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        certificate_number: document.getElementById('certificate_number').value,
        certificate_data: document.getElementById('certificate_data').value
    };

    try {
        const response = await fetch(`${API_URL}/api/members/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        const resultDiv = document.getElementById('registerResult');
        
        if (response.ok) {
            resultDiv.className = 'result-container success';
            resultDiv.innerHTML = `
                <h3>✓ Înregistrare Reușită!</h3>
                <p><strong>ID Membru:</strong> ${data.member.id}</p>
                <p><strong>Nume:</strong> ${data.member.name}</p>
                <p><strong>Certificat:</strong> ${data.member.certificate_number}</p>
                <p style="margin-top: 1rem;">Salvați ID-ul pentru a accesa profilul mai târziu!</p>
                <div class="qr-display">
                    <h4>Codul Dvs. QR:</h4>
                    <img src="${data.member.qr_code}" alt="QR Code">
                    <p style="margin-top: 1rem;"><small>Descărcați și salvați acest cod QR pentru a beneficia de reduceri</small></p>
                </div>
            `;
            document.getElementById('registerForm').reset();
        } else {
            resultDiv.className = 'result-container error';
            resultDiv.innerHTML = `<h3>✗ Eroare</h3><p>${data.error}</p>`;
        }
        
        resultDiv.style.display = 'block';
    } catch (error) {
        const resultDiv = document.getElementById('registerResult');
        resultDiv.className = 'result-container error';
        resultDiv.innerHTML = `<h3>✗ Eroare</h3><p>Nu s-a putut conecta la server</p>`;
        resultDiv.style.display = 'block';
    }
});

// QR Code Verification
async function verifyQRCode() {
    const qrData = document.getElementById('qr_data').value;
    const verifiedBy = document.getElementById('verified_by').value || 'Unknown';

    if (!qrData) {
        alert('Vă rugăm introduceți datele QR');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                qr_data: qrData,
                verified_by: verifiedBy
            })
        });

        const data = await response.json();
        const resultDiv = document.getElementById('verifyResult');
        
        if (response.ok && data.valid) {
            resultDiv.className = 'result-container success';
            resultDiv.innerHTML = `
                <h3>✓ Membru Valid!</h3>
                <p><strong>Nume:</strong> ${data.member.name}</p>
                <p><strong>Certificat:</strong> ${data.member.certificate_number}</p>
                <p><strong>Status:</strong> ${data.member.is_active ? 'Activ' : 'Inactiv'}</p>
                <p style="margin-top: 1rem; color: #4caf50; font-weight: 600;">
                    Membrul este eligibil pentru reduceri!
                </p>
            `;
        } else {
            resultDiv.className = 'result-container error';
            resultDiv.innerHTML = `<h3>✗ Cod Invalid</h3><p>${data.error || 'Membru negăsit sau inactiv'}</p>`;
        }
        
        resultDiv.style.display = 'block';
    } catch (error) {
        const resultDiv = document.getElementById('verifyResult');
        resultDiv.className = 'result-container error';
        resultDiv.innerHTML = `<h3>✗ Eroare</h3><p>Nu s-a putut verifica codul</p>`;
        resultDiv.style.display = 'block';
    }
}

// Load Discounts
async function loadDiscounts() {
    try {
        const response = await fetch(`${API_URL}/api/discounts`);
        const data = await response.json();
        
        const discountsGrid = document.getElementById('discountsList');
        
        if (data.discounts.length === 0) {
            discountsGrid.innerHTML = '<p>Nu există reduceri disponibile momentan.</p>';
            return;
        }
        
        discountsGrid.innerHTML = data.discounts.map(discount => `
            <div class="discount-card">
                <span class="discount-badge">${discount.discount_percentage}% REDUCERE</span>
                <h3>${discount.partner_name}</h3>
                <p>${discount.description || 'Prezentați codul QR la achiziție'}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading discounts:', error);
    }
}

// Add Discount
document.getElementById('discountForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        partner_name: document.getElementById('partner_name').value,
        description: document.getElementById('description').value,
        discount_percentage: parseInt(document.getElementById('discount_percentage').value)
    };

    try {
        const response = await fetch(`${API_URL}/api/discounts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        
        if (response.ok) {
            alert('Reducere adăugată cu succes!');
            document.getElementById('discountForm').reset();
            loadDiscounts();
        } else {
            alert(`Eroare: ${data.error}`);
        }
    } catch (error) {
        alert('Nu s-a putut adăuga reducerea');
    }
});

// Load Profile
async function loadProfile() {
    const memberId = document.getElementById('member_id').value;
    
    if (!memberId) {
        alert('Vă rugăm introduceți ID-ul de membru');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/members/${memberId}`);
        const data = await response.json();
        
        if (!response.ok) {
            alert(`Eroare: ${data.error}`);
            return;
        }

        const member = data.member;
        
        // Display profile data
        document.getElementById('profileName').textContent = member.name;
        document.getElementById('profileEmail').textContent = member.email;
        document.getElementById('profilePhone').textContent = member.phone || 'N/A';
        document.getElementById('profileCertificate').textContent = member.certificate_number;
        document.getElementById('profileCreated').textContent = new Date(member.created_at).toLocaleDateString('ro-RO');
        
        // Status badge
        const statusBadge = document.getElementById('profileStatus');
        statusBadge.textContent = member.is_active ? 'Activ' : 'Inactiv';
        statusBadge.className = `status-badge ${member.is_active ? 'active' : 'inactive'}`;
        
        // QR Code
        document.getElementById('profileQR').src = member.qr_code;
        
        // Load verifications
        loadVerifications(memberId);
        
        document.getElementById('profileData').style.display = 'block';
    } catch (error) {
        alert('Nu s-a putut încărca profilul');
    }
}

// Load Verifications History
async function loadVerifications(memberId) {
    try {
        const response = await fetch(`${API_URL}/api/members/${memberId}/verifications`);
        const data = await response.json();
        
        const historyDiv = document.getElementById('verificationsHistory');
        
        if (data.verifications.length === 0) {
            historyDiv.innerHTML = '<p>Nicio verificare înregistrată</p>';
            return;
        }
        
        historyDiv.innerHTML = data.verifications.map(v => `
            <div class="verification-item">
                <strong>Verificat la:</strong> ${new Date(v.verified_at).toLocaleString('ro-RO')}<br>
                <strong>Verificat de:</strong> ${v.verified_by}
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading verifications:', error);
    }
}

// Download QR Code
function downloadQR() {
    const qrImage = document.getElementById('profileQR');
    const link = document.createElement('a');
    link.href = qrImage.src;
    link.download = 'qr-code-membru.png';
    link.click();
}

// Load discounts on page load
document.addEventListener('DOMContentLoaded', () => {
    loadDiscounts();
});
