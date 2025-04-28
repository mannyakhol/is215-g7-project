// Required libraries
const mysql = require('mysql2');
const AWS = require('aws-sdk');

AWS.config.update({ region: 'us-west-2' }); //  AWS region
const rds = new AWS.RDS();

// Your RDS instance details
const dbHost = 'rds-endpoint.amazonaws.com';  // Replace with your RDS endpoint
const dbUser = 'db-username';
const dbPassword = 'db-password';
const dbName = 'database-name';

// Create a MySQL connection pool
const pool = mysql.createPool({
    host: dbHost,
    user: dbUser,
    password: dbPassword,
    database: dbName,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Function to query the database
const getData = async () => {
    try {
        pool.query('SELECT * FROM table_name', (err, results, fields) => {
            if (err) {
                console.error('Error executing query:', err);
                return;
            }
            console.log('Results:', results);
        });
    } catch (err) {
        console.error('Error:', err);
    }
};

// Execute the function to get data
getData();
