const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// API Routes

// Get all active members
app.get('/api/members', (req, res) => {
  db.all('SELECT id, name, email, phone, certificate_number, created_at, is_active FROM members WHERE is_active = 1', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ members: rows });
  });
});

// Register a new member
app.post('/api/members/register', async (req, res) => {
  const { name, email, phone, certificate_number, certificate_data } = req.body;

  if (!name || !email || !certificate_number) {
    return res.status(400).json({ error: 'Name, email and certificate number are required' });
  }

  const memberId = uuidv4();
  
  // Generate QR code with member information
  const qrData = JSON.stringify({
    id: memberId,
    name,
    certificate_number,
    timestamp: new Date().toISOString()
  });

  try {
    const qrCode = await QRCode.toDataURL(qrData);

    db.run(
      'INSERT INTO members (id, name, email, phone, certificate_number, certificate_data, qr_code) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [memberId, name, email, phone, certificate_number, certificate_data || '', qrCode],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Email or certificate number already exists' });
          }
          return res.status(500).json({ error: err.message });
        }
        res.json({
          success: true,
          member: {
            id: memberId,
            name,
            email,
            certificate_number,
            qr_code: qrCode
          }
        });
      }
    );
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Get member by ID
app.get('/api/members/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM members WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.json({ member: row });
  });
});

// Verify QR code
app.post('/api/verify', (req, res) => {
  const { qr_data, verified_by } = req.body;

  if (!qr_data) {
    return res.status(400).json({ error: 'QR data is required' });
  }

  try {
    const data = JSON.parse(qr_data);
    const memberId = data.id;

    db.get('SELECT * FROM members WHERE id = ? AND is_active = 1', [memberId], (err, member) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!member) {
        return res.status(404).json({ error: 'Member not found or inactive' });
      }

      // Log the verification
      db.run(
        'INSERT INTO verifications (member_id, verified_by) VALUES (?, ?)',
        [memberId, verified_by || 'Unknown'],
        (err) => {
          if (err) {
            console.error('Failed to log verification:', err);
          }
        }
      );

      res.json({
        valid: true,
        member: {
          id: member.id,
          name: member.name,
          certificate_number: member.certificate_number,
          is_active: member.is_active
        }
      });
    });
  } catch (err) {
    res.status(400).json({ error: 'Invalid QR code format' });
  }
});

// Get all discounts
app.get('/api/discounts', (req, res) => {
  db.all('SELECT * FROM discounts WHERE is_active = 1', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ discounts: rows });
  });
});

// Add a discount
app.post('/api/discounts', (req, res) => {
  const { partner_name, description, discount_percentage } = req.body;

  if (!partner_name || !discount_percentage) {
    return res.status(400).json({ error: 'Partner name and discount percentage are required' });
  }

  db.run(
    'INSERT INTO discounts (partner_name, description, discount_percentage) VALUES (?, ?, ?)',
    [partner_name, description || '', discount_percentage],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({
        success: true,
        discount: {
          id: this.lastID,
          partner_name,
          description,
          discount_percentage
        }
      });
    }
  );
});

// Get verification history for a member
app.get('/api/members/:id/verifications', (req, res) => {
  const { id } = req.params;
  
  db.all(
    'SELECT * FROM verifications WHERE member_id = ? ORDER BY verified_at DESC',
    [id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ verifications: rows });
    }
  );
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
