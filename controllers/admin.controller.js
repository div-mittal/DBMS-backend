import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import generateToken from '../utils/generateToken.js';
import bcrypt from 'bcryptjs';
import connection from '../config/db.js';

const adminSignUp = asyncHandler(async (req, res) => {
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

            res.status(200).json(
                new ApiResponse(200, 'Admin created successfully', {
                    id: result.insertId,
                    email: req.body.email,
                    type: 'admin',
                })
            );
        });
    });
});


const adminLogin = asyncHandler(async (req, res) => {
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

        res.status(200).json(
            new ApiResponse(200, 'Admin signed in successfully', {
                id: admin.id,
                email: admin.email,
                type: 'admin',
            })
        );
    });
});

const Manage = asyncHandler(async (req, res) => {
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
});

const Update = asyncHandler(async (req, res) => {
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
  });



export { adminSignUp, adminLogin, Manage, Update }