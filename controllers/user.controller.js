import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import generateToken from '../utils/generateToken.js';
import bcrypt from 'bcryptjs';
import connection from '../config/db.js';


const userSignUp = asyncHandler(async (req, res) => {
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

            // Respond with user data
            res.status(200)
                .json(
                    new ApiResponse(200, 'User created successfully', {
                        id: result.insertId,
                        name: req.body.firstName,
                        type: 'user',
                    })
                );
        });
    });
});

const userLogin = asyncHandler(async (req, res) => {
    console.log('User Sign In Form Data Received:', req.body); // Log the form data to the console

    // Check SQL query
    const query = 'SELECT * FROM users WHERE email = ?';
    connection.query(query, [req.body.email], (err, data) => {
        if (err) {
            return new res.status(500).json({ error: 'Internal server error' });;
        }

        // Check if email exists
        if (data.length === 0) {
            console.log('no email')
            return res.status(400).json({ error: 'Email not found' });
        }

        // Compare password
        const user = data[0];
        if (!bcrypt.compareSync(req.body.password, user.Password)) {
            return res.status(400).json({ error: 'Incorrect password' });
        }

        generateToken(res, user.id);

        // Respond with user data
        res.status(200).json(
            new ApiResponse(200, 'User logged in successfully', {
                id: user.id,
                name: user.FirstName,
                type: 'user',
            })
        );
    });
});

const donate = asyncHandler(async (req, res) => {
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
            res.status(200).send(
                new ApiResponse(200, 'Donation request submitted successfully')
            );
        });
    });
});

const findDonors = asyncHandler(async (req, res) => {
    console.log('Find Donors Form Data Received:', req.body); // Log the form data to the console

    const query = 'SELECT u.FirstName, u.LastName, d.Mobile FROM users u JOIN donors d ON u.id = d.ID WHERE d.State = ? AND d.District = ? AND d.BloodGroup = ?';

    connection.query(query, [req.body.state, req.body.district, req.body.bloodGroup], (err, data) => {
        if (err) {
            console.error('Error executing SELECT query:', err);
            return res.status(500).json({ error: 'Internal server error' });;
        }

        res.status(200).json(
            new ApiResponse(200, 'Donors found successfully', data)
        );
    });
});

const findBloodBanks = asyncHandler(async (req, res) => {
    console.log('Find Blood Banks Form Data Received:', req.body); // Log the form data to the console
    const reqBloodGroup = req.body.bloodGroup;

    const query = 'SELECT a.Name, a.email, b.?? FROM admin a JOIN bloodbank b ON a.id = b.id WHERE a.State = ? AND a.District = ? AND b.?? > 0';

    connection.query(query, [reqBloodGroup, req.body.state, req.body.district, reqBloodGroup], (err, data) => {
        if (err) {
            console.error('Error executing SELECT query:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.status(200).json(
            new ApiResponse(200, 'Blood banks found successfully', data)
        );
    });
});



export { userSignUp, userLogin, donate, findDonors, findBloodBanks }