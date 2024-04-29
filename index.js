import app from './app.js';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import generateToken from './utils/generateToken.js';
import asyncHandler from 'express-async-handler';

dotenv.config();
const PORT = process.env.PORT || 3000;

import connection from './config/db.js';


// Sign Up API
app.post('/api/sign-up', asyncHandler(async (req, res) => {
  console.log('User Sign Up Form Data Received:', req.body); // Log the form data to the console
  
  // Check SQL query
  const query = 'SELECT * FROM users WHERE email = ?';
  connection.query(query, [req.body.email], (err, data) => {
    if (err) {
      console.error('Error executing SELECT query:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    console.log('Query result:', data);

    // Check if email already exists
    if (data.length > 0) {
      return res.status(400).send('Email already exists');
    }

    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    // Insert user data into the database
    const values = [req.body.email, req.body.firstName, req.body.lastName, hash];
    const insertQuery = 'INSERT INTO users (email, FirstName, LastName, Password) VALUES (?)';

    connection.query(insertQuery, [values], (err, result) => {
      if (err) {
        console.error('Error inserting data:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      console.log('Data inserted successfully');
      generateToken(res, result.insertId);

      // Respond with user data
      res.status(200).json({ 
        id: result.insertId,
        name: req.body.firstName,
        type: 'user',
      });
    });
  });
}));

app.post('/api/sign-up-admin', asyncHandler(async (req, res) => {
  console.log('Admin Sign Up Form Data Received:', req.body); // Log the form data to the console

  const query = 'SELECT * FROM admin WHERE email = ?';
  connection.query(query, [req.body.email], (err, data) => {
    if (err) {
      console.error('Error executing SELECT query:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    console.log('Query result:', data);

    if (data.length > 0) {
      return res.status(400).send('Email already exists');
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    const values = [req.body.email, req.body.bankName, req.body.state, req.body.district, hash];
    const insertQuery = 'INSERT INTO admin (email, Name, State, District, Password) VALUES (?)';

    connection.query(insertQuery, [values], (err, result) => {
      if (err) {
        console.error('Error inserting data:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      const tableQuery = 'INSERT INTO bloodbank (id) VALUES (?)';
      connection.query(tableQuery, [result.insertId], (err, result) => {
        if (err) {
          console.error('Error inserting data:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }
        console.log('first table inserted successfully')
      });
      console.log('Data inserted successfully');
      generateToken(res, result.insertId);

      res.status(200).json({ 
        id: result.insertId,
        email: req.body.email,
        type: 'admin',
      });
    });

    
  });
}));


// Sign In API
app.post('/api/sign-in', asyncHandler(async (req, res) => {
  console.log('User Sign In Form Data Received:', req.body); // Log the form data to the console

  // Check SQL query
  const query = 'SELECT * FROM users WHERE email = ?';
  connection.query(query, [req.body.email], (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Check if email exists
    if (data.length === 0) {
      return res.status(400).send('Email does not exist');
    }

    // Compare password
    const user = data[0];
    if (!bcrypt.compareSync(req.body.password, user.Password)) {
      return res.status(400).send('Invalid password');
    }

    generateToken(res, user.id);

    // Respond with user data
    res.status(200).json({ 
      id: user.id,
      name: user.FirstName,
      type: 'user'
    });
  });
}));

app.post('/api/sign-in-admin', asyncHandler(async (req, res) => {
  console.log('Admin Sign In Form Data Received:', req.body); // Log the form data to the console

  // Check SQL query
  const query = 'SELECT * FROM admin WHERE email = ?';
  connection.query(query, [req.body.email], (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (data.length === 0) {
      return res.status(400).send('Email does not exist');
    }

    const admin = data[0];
    if (!bcrypt.compareSync(req.body.password, admin.Password)) {
      return res.status(400).send('Invalid password');
    }
    console.log(admin)

    generateToken(res, admin.id);

    res.status(200).json({ 
      id: admin.id,
      email: admin.email,
      type: 'admin',
    });
  });
}));

// Donate API
app.post('/api/donate', asyncHandler(async (req, res) => {
  console.log('Donor Form Data Received:', req.body); // Log the form data to the console

  const query = 'SELECT * FROM donors WHERE ID = ?';
  connection.query(query, [req.body.userID], (err, data) => {
    if (err) {
      console.error('Error executing SELECT query:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    console.log('Query result:', data);

    // Check if user has already donated
    if (data.length > 0) {
      return res.status(400).send('User has already donated');
    }

    // Insert donor data into the database
    const values = [req.body.userID, req.body.state, req.body.district, req.body.mobile, req.body.bloodGroup];
    const insertQuery = 'INSERT INTO donors (ID, State, District, Mobile, BloodGroup) VALUES (?)';

    connection.query(insertQuery, [values], (err, result) => {
      if (err) {
        console.error('Error inserting data:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      console.log('Data inserted successfully');
      res.status(200).send('Donation request submitted successfully');
    });
  });
}));

// Find Donors and Blood Banks API
app.post('/api/find-donors', asyncHandler(async (req, res) => {
  console.log('Find Donors Form Data Received:', req.body); // Log the form data to the console

  const query = 'SELECT u.FirstName, u.LastName, d.Mobile FROM users u JOIN donors d ON u.id = d.ID WHERE d.State = ? AND d.District = ? AND d.BloodGroup = ?';
  
  connection.query(query, [req.body.state, req.body.district, req.body.bloodGroup], (err, data) => {
    if (err) {
      console.error('Error executing SELECT query:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    console.log('Query result:', data);

    res.status(200).json(data);
  });
}));

app.post('/api/find-blood-banks', asyncHandler(async (req, res) => {
  console.log('Find Blood Banks Form Data Received:', req.body); // Log the form data to the console
  const reqBloodGroup = req.body.bloodGroup;

  const query = 'SELECT a.Name, a.email, b.?? FROM admin a JOIN bloodbank b ON a.id = b.id WHERE a.State = ? AND a.District = ? AND b.?? > 0';
  
  connection.query(query, [reqBloodGroup, req.body.state, req.body.district, reqBloodGroup], (err, data) => {
    if (err) {
      console.error('Error executing SELECT query:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    console.log('Query result:', data);

    res.status(200).json(data);
  });
}));


// Manage Blood Bank API
app.get('/api/bloodbank/:id', asyncHandler(async (req, res) => {
  const id = req.params.id;
  // console.log(id)
  const query = 'SELECT a.Name, b.* FROM admin a JOIN bloodbank b ON a.id = b.id WHERE b.ID = ?';
  connection.query(query, [id], (err, data) => {
    if (err) {
      console.error('Error executing SELECT query:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    console.log('Query result:', data[0]);
    res.status(200).json(data[0]);
  });
}));

app.post('/api/bloodbank/:id', asyncHandler(async (req, res) => {
  const id = req.params.id;
  const query = 'UPDATE bloodbank SET ? WHERE ID = ?';
  connection.query(query, [req.body, id], (err, data) => {
    if (err) {
      console.error('Error executing UPDATE query:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    console.log('Query result:', data);
    res.status(200).json(data);
  });
}));


app.post('/api/sign-out', asyncHandler(async (req, res) => {
  res.clearCookie('jwt');
  res.status(200).send('Logged out successfully');
}));



app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
  next();
});

// Start the server
app.listen(PORT, () => {  
  console.log(`Server is running on http://localhost:${PORT}`);
})  
