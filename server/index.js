require("dotenv").config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

const app = express();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(session({
    secret: 'remind_secret',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:8000/auth/google/callback',
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/gmail.readonly']
}, (accessToken, refreshToken, profile, done) => {
    return done(null, { profile, accessToken });
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

app.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/gmail.readonly']
}));

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: 'http://localhost:3000' }),
    (req, res) => {
        res.redirect('http://localhost:3000');
    }
);

app.get('/auth/user', (req, res) => {
    if (req.user) {
        res.json({ user: req.user.profile, accessToken: req.user.accessToken });
    } else {
        res.json({ user: null });
    }
});

app.get('/auth/logout', (req, res) => {
    req.logout(() => {
        res.json({ success: true });
    });
});

app.get('/gmail/sync', async (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Not logged in' });
    const accessToken = req.user.accessToken;
    try {
        const gmailRes = await fetch(
            'https://gmail.googleapis.com/gmail/v1/users/me/messages?q=subject:application+OR+subject:applying&maxResults=70',
            { headers: { Authorization: 'Bearer ' + accessToken } }
        );
        const gmailData = await gmailRes.json();
        if (!gmailData.messages) return res.json({ synced: 0 });
        let synced = 0;
        for (const msg of gmailData.messages) {
            try {
                const msgRes = await fetch(
                    'https://gmail.googleapis.com/gmail/v1/users/me/messages/' + msg.id + '?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date',
                    { headers: { Authorization: 'Bearer ' + accessToken } }
                );
                const msgData = await msgRes.json();
                if (!msgData.payload || !msgData.payload.headers) continue;
                const headers = msgData.payload.headers;
                const subject = (headers.find(h => h.name === 'Subject') || {}).value || 'Unknown Role';
                const from = (headers.find(h => h.name === 'From') || {}).value || 'Unknown Company';
                const date = (headers.find(h => h.name === 'Date') || {}).value || '';
                const companyMatch = from.match(/^([^<@\n]+)/);
                const company = companyMatch ? companyMatch[1].trim().replace(/"/g, '') : 'Unknown';
                const role = subject.slice(0, 100);
                let dateApplied = new Date().toISOString().split('T')[0];
                if (date) {
                    const parsed = new Date(date);
                    if (!isNaN(parsed.getTime())) {
                        dateApplied = parsed.toISOString().split('T')[0];
                    }
                }
                const { data: existing } = await supabase
                    .from('applications')
                    .select('id')
                    .eq('company', company)
                    .eq('role', role)
                    .limit(1);

                if (!existing || existing.length === 0) {
                    const { error } = await supabase
                        .from('applications')
                        .insert([{ company, role, date_applied: dateApplied, status: 'applied', cv_url: null }]);
                    if (!error) synced++;
                }
                if (!error) synced++;
            } catch (msgErr) {
                continue;
            }
        }
        res.json({ synced });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/', (req, res) => {
    res.send('ReMind API is running!');
});

app.post('/applications', async (req, res) => {
    const { company, role, date_applied, cv_url, status } = req.body;
    const { data, error } = await supabase
        .from('applications')
        .insert([{ company, role, date_applied, cv_url, status: status || 'applied' }])
        .select();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data[0]);
});

app.get('/applications', async (req, res) => {
    const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

const PORT = process.env.PORT || 8000;
app.patch('/applications/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const { data, error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', id)
        .select();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0]);
});
app.listen(PORT, () => {
    console.log('Server running on port ' + PORT);
});
