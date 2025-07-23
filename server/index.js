const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const chatRoutes = require('./routes/chatRoutes');
dotenv.config();

const app = express();
const PORT = 5000;

// import routes

app.use(cors());
app.use(express.json());

// mount chat routes
app.use('/api/chat', chatRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});