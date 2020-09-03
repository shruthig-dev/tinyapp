const express = require("express");
const bodyParser = require("body-parser");
///var morgan = require('morgan')
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const { createUser, getUserByEmailId, checkPassword } = require('./views/helpers/helpers');

const app = express();
const salt = bcrypt.genSaltSync(10);
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
//app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const usersObject = {
  "8O6nO1":
  {
    id: "8O6nO1",
    email: "test@gmail.com",
    password: "$2b$10$JlZmr08Ye1E38ocxJuT8hOuUQUSKJO47MX5t/1.4816nxwlRfLzPy"
  }

};

app.get("/login", (req, res) => {
  let templateVars = { user: req.cookies["user"] };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  let user = getUserByEmailId(usersObject, req.body.email);

  if (user === null) {
    res.status(403).json({ error: "User does not exists.Plese enter valid Email Id" });
  } else if (checkPassword(bcrypt, user, req.body.password)) {
    console.log("________________" + JSON.stringify(user));
    res.cookie('user', JSON.stringify(user));
    res.redirect("/urls");
  } else {
    res.status(403).json({ error: "Incorrect password.Please enter valid password" });
  }
});
app.post("/logout", (req, res) => {
  res.clearCookie('user', null);
  res.redirect("login");
});

app.get("/register", (req, res) => {
  let templateVars = { user: req.cookies["user"] };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    res.status(400).json({ error: "Please enter Email Id" });
  } else if (!password) {
    res.status(400).json({ error: "Please enter Password" });
  } else if (getUserByEmailId(usersObject, email) !== null) {
    res.status(400).json({ error: `User with  ${email} already exists in database` });//success: false,
  } else {

    const hashedPassword = bcrypt.hashSync(password, salt);
    const userId = generateRandomString();
    console.log(email + "PWD" + password);
    createUser(usersObject, userId, email, hashedPassword);
    res.cookie('user', JSON.stringify(usersObject[userId]));
    res.redirect('/urls');
  }
});

app.get("/urls", (req, res) => {
  console.log(JSON.parse(req.cookies["user"]));
  let user = req.cookies["user"] !== null ? JSON.parse(req.cookies["user"]) : null;

  let templateVars = { urls: urlDatabase, user: user };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  let templateVars = { user: req.cookies["user"] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let user = req.cookies["user"] !== null ? JSON.parse(req.cookies["user"]) : null;
  let templateVars = {
    shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]
    , user: user
  };

  if (templateVars.longURL !== undefined || null) {
    res.render("urls_show", templateVars);
  } else {
    res.send("Url not found");
  }
  res.render("urls_show", templateVars);
});
app.get("/hello", (req, res) => {
  let templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (longURL !== undefined || null) {
    res.redirect(longURL);
  } else {
    res.send("Not Found");
  }
});
app.post("/urls", (req, res) => {
  let user = req.cookies["user"] !== null ? JSON.parse(req.cookies["user"]) : null;
  let newUrlId = generateRandomString();
  let formattedUrl = formatUrl(req.body.longURL);

  urlDatabase[newUrlId] = formattedUrl;
  let newUrl = urlDatabase[newUrlId];

  if (newUrl !== undefined || null) {
    let templateVars = { urls: urlDatabase, user: user };
    res.render("urls_index", templateVars);
  } else {
    res.send("Error : Not able to create new url");
  }
});
//Update URL
app.post("/urls/:id", (req, res) => {
  let url = urlDatabase[req.params.id];
  let user = req.cookies["user"] !== null ? JSON.parse(req.cookies["user"]) : null;

  if (url !== undefined || null) {
    urlDatabase[req.params.id] = req.body.longURL;
    let templateVars = { urls: urlDatabase, user: user };
    res.render("urls_index", templateVars);
  } else {
    res.send("Url not found");
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const id = req.params.shortURL;

  if (Object.prototype.hasOwnProperty.call(urlDatabase, id)) {
    //if (urlDatabase.hasOwnProperty(id)) {
    delete urlDatabase[id];
    if (!Object.prototype.hasOwnProperty.call(urlDatabase, id)) {

      res.redirect("/urls");
    } else {
      res.send("Delete operation failed.");
    }
  } else {
    res.send("Not Found");
  }
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

let generateRandomString = () => {
  let result = '';
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 6; i > 0; --i) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};
let formatUrl = (url) => {
  if (validURL(url)) {
    return url;
  } else {
    url = 'https://' + url;
  }
  return url;
};
let validURL = (url) => {
  let pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
  return !!pattern.test(url);
};