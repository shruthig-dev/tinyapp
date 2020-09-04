const express = require('express');
const bodyParser = require('body-parser');
/// var morgan = require('morgan')
const bcrypt = require('bcrypt');
var cookieSession = require('cookie-session');


const {
  createUser, getUserByEmailId, checkPassword, authorizeUser,
  checkIfUserCookieExists, geturlsForUser,
} = require('./views/helpers/helpers');

const app = express();
const salt = bcrypt.genSaltSync(10);
const PORT = 8080;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieSession({
  name: 'session',
  keys: ['4146fa26-72b8-4caf-be85-d465e73af448', 'd6b96b47-3582-4d9d-83fa-560daab4c45a']
}));

const generateRandomString = () => {
  let result = '';
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 6; i > 0; i -= 1) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

const formatUrl = (url) => {
  if (!/^https?:\/\//i.test(url)) {
    return `http://${url}`;
  }
  return url;
};

const urlDatabase = {
  'b2xVn2': { longURL: 'http://www.lighthouselabs.ca', userID: '8O6nO1' },
  '9sm5xK': { longURL: 'http://www.google.com', userID: '8O6nO1' },
  'JRw7Io': { longURL: 'http://www.democode.com', userID: 'QQxsUG' }
};

const usersObject = {
  '8O6nO1':
  {
    id: '8O6nO1',
    email: 'test@gmail.com',
    password: '$2b$10$JlZmr08Ye1E38ocxJuT8hOuUQUSKJO47MX5t/1.4816nxwlRfLzPy',
  },
  'QQxsUG':
  {
    id: "QQxsUG",
    email: "demo@gmail.com",
    password: "$2b$10$bFx8wqot69EuCJ4S8D/cculXI0e4F/RpC3vYTHdt5NVokwgEkB8gO"
  }
};

app.get('/login', (req, res) => {
  const templateVars = { user: usersObject[req.session.id] };
  res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  const user = getUserByEmailId(usersObject, req.body.email);

  if (user === null) {
    res.status(403).json({ error: 'User does not exists.Plese enter valid Email Id' });
  } else if (checkPassword(bcrypt, user, req.body.password)) {
    req.session.user = user;
    res.redirect('/urls');
  } else {
    res.status(403).json({ error: 'Incorrect password.Please enter valid password' });
  }
});
app.post('/logout', (req, res) => {
  res.clearCookie('user', null);
  res.redirect('login');
});

app.get('/register', (req, res) => {
  const templateVars = { user: req.session.id };
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    res.status(400).json({ error: 'Please enter Email Id' });
  } else if (!password) {
    res.status(400).json({ error: 'Please enter Password' });
  } else if (getUserByEmailId(usersObject, email) !== null) {
    res.status(400).json({ error: `User with  ${email} already exists in database` });// success: false,
  } else {
    const hashedPassword = bcrypt.hashSync(password, salt);
    const userId = generateRandomString();
    createUser(usersObject, userId, email, hashedPassword);
    req.session.user = usersObject[userId];
    res.redirect('/urls');
  }
});

app.get('/urls', (req, res) => {
  console.log(JSON.stringify(req.session.user))
  if (checkIfUserCookieExists(req.session.user)) {
    const user = req.session.user;
    const urlsForUser = geturlsForUser(urlDatabase, user.id);
    console.log(JSON.stringify(urlDatabase))
    const templateVars = { urls: urlsForUser, user };
    res.render('urls_index', templateVars);
  } else {
    res.status(404);
    res.render('error', { error: 'Please Login/Register to view URLS' });
  }
});

app.post('/urls', (req, res) => {
  const userSessionObj = req.session.user;

  if (checkIfUserCookieExists(userSessionObj)) {
    if (req.body.longURL === null) {
      res.status(403).json({ error: 'Please enter URL' });
    } else {
      const newUrlId = generateRandomString();
      const formattedUrl = formatUrl(req.body.longURL);

      urlDatabase[newUrlId] = { longURL: formattedUrl, userID: userSessionObj.id };

      res.redirect('/urls');
    }
  } else {
    res.render('error', { error: 'Please login to create Urls' });
  }
});

app.get('/urls/new', (req, res) => {
  const templateVars = { user: req.session.user };
  res.render('urls_new', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const userSessionObj = req.session.user;

  if (checkIfUserCookieExists(userSessionObj)) {
    const url = urlDatabase[req.params.shortURL];

    if (url && authorizeUser(url.userID, userSessionObj.id)) {
      console.log("________"+JSON.stringify(req.params.shortURL));

      const templateVars = {
        shortURL: req.params.shortURL, longURL: url.longURL, user: userSessionObj
      };
      res.render('urls_show', templateVars);
    } else {
      res.status(401);
      res.render('error', { error: 'Not-Authorized to access this URL' });
    }
  } else {
    res.status(404);
    res.render('error', { error: 'Please Login/Register to view URLS' });
  }
});

app.get('/u/:shortURL', (req, res) => {
  const userSessionObj = req.session.user;
  if (checkIfUserCookieExists(userSessionObj)) {
    const url = urlDatabase[req.params.shortURL];

    if (url !== undefined && authorizeUser(url.userID, userSessionObj.id)) {
      res.redirect(url.longURL);
    }
  } else {
    res.status(404);
    res.render('error', { error: 'Please Login/Register to view URLS' });
  }
});

// Update URL
app.post('/urls/:id', (req, res) => {
  if (checkIfUserCookieExists(req.session.user)) {

    const url = urlDatabase[req.params.id];
    const userSessionObj = req.session.user;
    if (authorizeUser(url.userID, userSessionObj.id)) {

      urlDatabase[req.params.id].longURL = req.body.longURL;
      console.log("!!!190!!!!!!!" + JSON.stringify(urlDatabase));
      const templateVars = { urls: urlDatabase, user: userSessionObj };
      res.render('urls_index', templateVars);
    } else {
      res.status(401);
      res.render('error', { error: 'Not-Authorized to access this URL' });
    }
  } else {
    res.status(404);
    res.render('error', { error: 'Please Login/Register to view URLS' });
  }
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const userSessionObj = req.session.user;
  if (checkIfUserCookieExists(userSessionObj)) {
    const url = (urlDatabase[req.params.shortURL]);

    if (authorizeUser(url.userID, userSessionObj.id)) {
      urlDatabase[req.params.shortURL].userID = null;

      if (urlDatabase[req.params.shortURL]) {
        res.redirect('/urls');
      } else {
        res.render('error', { error: 'Delete operation failed.' });
      }
    } else {
      res.status(401);
      res.render('error', { error: 'Not-Authorized to access this URL' });
    }
  } else {
    res.status(404);
    res.render('error', { error: 'Please Login/Register to view URLS' });
  }
});
app.get('/', (req, res) => {
  res.redirect('/urls');
});

app.listen(PORT, () => {
  // console.log(`Example app listening on port ${PORT}!`);
});
