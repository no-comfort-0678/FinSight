const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
let users = [];
app.post('/signup', (req, res) => {
    const{ username, password } = req.body;
    const userExists = users.find(u => u.username === username);
    if(userExists){
        return res.status(400).json({ message: "User already exists" });
    }
    users.push({ username, password });
    res.json({ message: "Signup successful" });
});

app.post('/login', (req, res) => {
    const{ username, password } = req.body;
    const user = users.find(u => u.username === username);
    if(!user){
        return res.status(404).json({ message: "User not found" });
    }
    if(user.password !== password){
        return res.status(401).json({ message: "Invalid credentials" });
    }
    res.json({ message: "Login successful", user:{ username } });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});