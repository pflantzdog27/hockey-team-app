const express = require('express');
const axios = require('axios');
const session = require('express-session');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { AuthClient, RestliClient } = require('linkedin-api-client');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log(err));

// Models
const User = mongoose.model('User', new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  linkedinId: String,
}));

const LinkedInProfile = mongoose.model('LinkedInProfile', new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  linkedinData: Object,
}));

const Candidacy = mongoose.model('Candidacy', new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  office: String,
  platform: String,
}));

const OfficeRequirements = mongoose.model('OfficeRequirements', new mongoose.Schema({
  office: String,
  requirements: [String],
}));

app.use(cors());
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: true,
}));

const authClient = new AuthClient({
  clientId: process.env.LINKEDIN_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  redirectUrl: process.env.LINKEDIN_REDIRECT_URI
});

const restliClient = new RestliClient();
restliClient.setDebugParams({ enabled: true });

app.get('/api/user', (req, res) => {
  if (!req.session.accessToken) {
    res.status(401).json({ error: 'Unauthorized' });
  } else {
    res.json({ user: req.session.user });
  }
});

app.get('/auth/linkedin', (req, res) => {
  res.redirect(authClient.generateMemberAuthorizationUrl(['profile', 'email', 'openid']));
});

app.get('/auth/linkedin/callback', (req, res) => {
  const authCode = req.query.code;
  if (authCode) {
    authClient.exchangeAuthCodeForAccessToken(authCode)
    .then(async (response) => {
      req.session.accessToken = response.access_token;
      const profileResponse = await restliClient.get({
        resourcePath: '/userinfo',
        accessToken: req.session.accessToken
      });
      req.session.user = profileResponse.data;
      console.log(`Access token: ${req.session.accessToken}`);
      res.redirect('/');
    })
    .catch((error) => {
      console.error('Error while exchanging auth code for access token:', error.response ? error.response.data : error.message);
      res.send('Error exchanging auth code for access token.');
    });
  } else {
    if (req.query.error_description) {
      res.send(`Error: ${req.query.error_description}`);
    } else {
      res.send('Expecting "code" query parameter');
    }
  }
});

app.post('/register', async (req, res) => {
  const { username, email, password, linkedinId } = req.body;
  try {
    const newUser = new User({ username, email, password, linkedinId });
    await newUser.save();
    req.session.userId = newUser._id;
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use(express.static(path.join(__dirname, 'politicise-me-frontend/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'politicise-me-frontend/build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Navigate to example app at http://localhost:${port}`);
});
