const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  let templateVars = { 
    urls: urlDatabase,
  };

  if (req.cookies) {
    templateVars.loggedIn = true;
    templateVars.username = req.cookies["username"];
  } else {
    templateVars.loggedIn = false;
    templateVars.username = false;
  }

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {};
  if (req.cookies) {
    templateVars.loggedIn = true;
    templateVars.username = req.cookies["username"];
  } else {  
    templateVars.loggedIn = false;
    templateVars.username = false
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  let newURL = generateRandomString();
  urlDatabase[newURL] = req.body.longURL;
  res.redirect(301, `/urls/${newURL}`);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: req.params.longURL,
  };

  if (req.cookies) {
    templateVars.loggedIn = true;
    templateVars.username = req.cookies["username"];
  } else {
    templateVars.loggedIn = false;
    templateVars.username = false;
  }

  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = "http://" + urlDatabase[req.params.shortURL];
  console.log(longURL);
  res.redirect(longURL);
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`)
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const toDelete = req.params.shortURL;
  console.log(toDelete);
  delete urlDatabase[toDelete];
  res.redirect("/urls");
});

app.post("/urls/:shortURL/update", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  res
    .cookie("username", req.body.username)
    .cookie("loggedIn", true);

  console.log('username is ' + req.body.username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.clearCookie("loggedIn");
  res.redirect("/urls");
});

function generateRandomString() {
  const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"
  let length = characters.length;
  let result = "";
  for (let i = 0; i < 5; i++){
    result += characters.charAt(Math.floor(Math.random() * length));
  }

  return result;
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
