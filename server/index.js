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
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(session({
    secret: 'remind_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: false
    }
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL || 'http://localhost:8000/auth/google/callback', scope: ['profile', 'email', 'https://www.googleapis.com/auth/gmail.readonly']
}, (accessToken, refreshToken, profile, done) => {
    return done(null, { profile, accessToken });
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

app.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/gmail.readonly']
}));

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: process.env.FRONTEND_URL || 'http://localhost:3000' }),
    (req, res) => {
        const token = req.user ? req.user.accessToken : null;
        res.redirect((process.env.FRONTEND_URL || 'http://localhost:3000') + '?token=' + token);
    }
);

app.get('/auth/user', (req, res) => {
    const token = req.query.token;
    if (req.user) {
        res.json({ user: req.user.profile, accessToken: req.user.accessToken });
    } else if (token) {
        res.json({ user: { displayName: 'Roshan' }, accessToken: token });
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
    const accessToken = req.query.token;
    if (!accessToken) return res.status(401).json({ error: 'Not logged in' });

    let synced = 0;
    let rejected = 0;
    let interviews = 0;

    try {
        const gmailRes = await fetch(
            'https://gmail.googleapis.com/gmail/v1/users/me/messages?q=subject:application+OR+subject:applying+OR+subject:unfortunately+OR+subject:regret+OR+subject:screening+OR+subject:interview&maxResults=100',
            { headers: { Authorization: 'Bearer ' + accessToken } }
        );
        const gmailData = await gmailRes.json();
        if (!gmailData.messages) return res.json({ synced, rejected, interviews });

        for (const msg of gmailData.messages) {
            try {
                const msgRes = await fetch(
                    'https://gmail.googleapis.com/gmail/v1/users/me/messages/' + msg.id + '?format=full',
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

                const subjectLower = subject.toLowerCase();
                const bodySnippet = (msgData.snippet || '').toLowerCase();
                const combined = subjectLower + ' ' + bodySnippet;

                console.log('SUBJECT:', subject.slice(0, 80));
                console.log('SNIPPET:', bodySnippet.slice(0, 100));

                let status = 'applied';
                if (
                    combined.includes('unfortunately') ||
                    combined.includes('regret to inform') ||
                    combined.includes('not moving forward') ||
                    combined.includes('we will not') ||
                    combined.includes('other candidates') ||
                    combined.includes('we have decided') ||
                    combined.includes('not selected') ||
                    combined.includes('not be moving')
                ) {
                    status = 'rejected';
                } else if (
                    combined.includes('screening') ||
                    combined.includes('interview') ||
                    combined.includes('speak with you') ||
                    combined.includes('schedule a call') ||
                    combined.includes('next steps') ||
                    combined.includes('pleased to invite')
                ) {
                    status = 'interview';
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
                        .insert([{ company, role, date_applied: dateApplied, status, cv_url: null }]);
                    if (!error) {
                        synced++;
                        if (status === 'rejected') rejected++;
                        if (status === 'interview') interviews++;
                    }
                } else {
                    if (status === 'rejected' || status === 'interview') {
                        await supabase
                            .from('applications')
                            .update({ status })
                            .eq('company', company)
                            .eq('role', role);
                        if (status === 'rejected') rejected++;
                        if (status === 'interview') interviews++;
                    }
                }
            } catch (msgErr) {
                continue;
            }
        }

        res.json({ synced, rejected, interviews });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/', (req, res) => {
    res.send('ReMind API is running!');
});

app.get('/applications', async (req, res) => {
    const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
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

app.patch('/applications/:id/cv', async (req, res) => {
    const { id } = req.params;
    const { cv_url } = req.body;
    const { data, error } = await supabase
        .from('applications')
        .update({ cv_url })
        .eq('id', id)
        .select();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0]);
});
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

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log('Server running on port ' + PORT);
});