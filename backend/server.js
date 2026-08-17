require('dotenv').config({ path: '../.env' }); // Assuming .env is in the root, but let's also allow one in backend
// Actually let's just use require('dotenv').config(); and we'll put .env in backend/
require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB()
    .then(() => {
        console.log('Database connected successfully.');
    })
    .catch((error) => {
        console.error('Failed to connect to the database.');
        console.error(`Database connection error: ${error.message}`);
        // Not exiting the process so that /api/health can still be served and tested.
    });

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
