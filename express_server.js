const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const PORT = 8080; // default port 8080
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
  let templateVars = { urls : urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  let newURL = generateRandomString();
  urlDatabase[newURL] = req.body.longURL;
  res.redirect(301, `/urls/${newURL}`);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: req.params.longURL};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = "http://" + urlDatabase[req.params.shortURL];
  console.log(longURL);
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const toDelete = req.params.shortURL;
  console.log(toDelete);
  delete urlDatabase[toDelete];
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
