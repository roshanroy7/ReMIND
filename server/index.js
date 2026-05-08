const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();

app.use(cors({
    origin: 'http://localhost:3000'
}));
app.use(express.json());

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// Test route
app.get('/', (req, res) => {
    res.send('ReMind API is running!');
});

// Add new application
app.post('/applications', async (req, res) => {
    const { company, role, date_applied, cv_url, status } = req.body;

    const { data, error } = await supabase
        .from('applications')
        .insert([{ company, role, date_applied, cv_url, status: status || 'applied' }])
        .select();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.status(201).json(data[0]);
});

// Get all applications
app.get('/applications', async (req, res) => {
    const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.json(data);
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});