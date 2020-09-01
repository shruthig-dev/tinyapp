const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");


app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls", (req, res) => {
  let templateVars = {urls:urlDatabase};
  res.render("urls_index",templateVars);
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };

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
  
  let newUrlId = generateRandomString();
  let formattedUrl = formatUrl(req.body.longURL);
  
  urlDatabase[newUrlId] = formattedUrl;
  let newUrl = urlDatabase[newUrlId];

  if (newUrl !== undefined || null) {
    let templateVars = {urls:urlDatabase};
    res.render("urls_index",templateVars);
  } else {
    res.send("Error : Not able to create new url");
  }
});

app.post("/urls/:id",(req,res) => {
  let url = urlDatabase[req.params.id];
  if (url !== undefined || null) {
    urlDatabase[req.params.id] = req.body.longURL;
    res.redirect("/urls");
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
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return !!pattern.test(url);
};