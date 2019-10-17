const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
const PORT = 8080; // default port 8080
const app = express();
app.set("view engine", "ejs");
app.set('trust proxy', 1) // trust first proxy
app.use(bodyParser.urlencoded({extended: true}));
//app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ["userId", "email"]
}));

//URL DATABASE
const urlDatabase = {
  "b2xVn2": { longUrl: "www.lighthouselabs.ca", userId: "testUser" },
  "9sm5xK": { longUrl: "www.google.com", userId: "testUser2" }
};

//USER DATABASE
const users = {
  testUser: {
    id: "testUser",
    email: "aaaa@aaaa.com",
    password: bcrypt.hashSync("test", 10)
  }
};

//GENERATE SHORT URL STRING
function generateRandomString() {
  const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"
  let length = characters.length;
  let result = "";
  for (let i = 0; i < 5; i++){
    result += characters.charAt(Math.floor(Math.random() * length));
  }

  return result;
};
//SHOW LIST OF URLs via redirect
app.get("/", (req, res) => {
  res.redirect("/urls");
});

//SHOW LIST OF URLs
app.get("/urls", (req, res) => {

  if (req.session.userId) {
    const email = req.session.email;
    const userId = req.session.userId;
    const loggedIn = true;
    let urls = {};
    let templateVars = {
      email,
      userId,
      loggedIn,
      urls
    };
    
    for (let url in urlDatabase) {
      if (urlDatabase[url].userId === req.session.userId) {
        templateVars.urls[url] = urlDatabase[url];
      }
    }

    res.render("urls_index", templateVars);
  } else {
    let error = "Please login!";
    userId = null;
    let templateVars = {
      error
    };
    res.render("login", templateVars);
  }

});

//SHOW CREATE NEW SHORT URL PAGE
app.get("/urls/new", (req, res) => {
  let templateVars = {};

  if (!req.session.email) {
    templateVars.userId = null;
    templateVars.error = "Please login!";
    res.render("login", templateVars);
  } else {  
    templateVars.loggedIn = true;
    templateVars.email = req.session["email"];
    templateVars.userId = req.session["userId"];
    res.render("urls_new", templateVars);
  }
});

//SHOW EDIT URL PAGE FOR PRE-EXISTING SHORT URLs
app.get("/urls/:shortURL", (req, res) => {
  let shortUrl = req.params.shortURL;
  let longUrl = urlDatabase[shortUrl].longUrl;
  let templateVars = {
    shortUrl,
    longUrl
  };

  //if logged in, set necessary template vars for EJS
  if (req.session.email) {
    templateVars.loggedIn = true;
    templateVars.email = req.session.email;
    templateVars.userId = req.session.userId;
  } else {
    templateVars.loggedIn = false;
    templateVars.email = false;
    templateVars.userId = false;
  }

  res.render("urls_show", templateVars);
});

//REDIRECT TO LONG URL
app.get("/u/:shortURL", (req, res) => {
  const longURL = "https\://" + urlDatabase[req.params.shortURL].longUrl;
  res.redirect(longURL);
});

//REGISTER PAGE
app.get("/register", (req, res) => {
  let templateVars = {
    userId: null
  };

  res.render("register", templateVars);
});

//LOGIN PAGE
app.get("/login", (req, res) => {
  let templateVars = {
    userId: null
  };

  res.render("login", templateVars);
});

//REGISTER BUTTON CLICK
app.post("/register", (req, res) => {
  const { email } = req.body;
  const input = req.body.password;
  if (email.length === 0 || input.length === 0) {
    const templateVars = {
      error: "All fields required!"
    };
    res.redirect("/register", templateVars);
  }

  const password = bcrypt.hashSync(input, 10);
  let userId = generateRandomString();
  for (clientId in users) {
    if (email === users[clientId].email) {
      res.redirect("/urls");
    }
  }

  users[userId] = {
    userId,
    email,
    password
  };

  req.session = {
    userId,
    email
  };
  res.redirect("/urls/");
});

//GENERATE NEW SHORT URL
app.post("/urls", (req, res) => {
  if (!req.session.userId) {
    const templateVars = {
      error: "Please login!"
    };
    res.redirect("/urls/", templateVars);
  }
  let newURL = generateRandomString();
  urlDatabase[newURL] = { longUrl: req.body.longURL, userId: req.session.userId };
  res.redirect(301, `/urls/${newURL}`);
});

//SHORT URL CLICK & REDIRECT
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`)
});

//DELETE BUTTON CLICK
app.post("/urls/:shortURL/delete", (req, res) => {
  const toDelete = req.params.shortURL;
  const templateVars = {};

  if (!req.session) {
    templateVars.error = "not logged in - cannot delete";
    res.redirect("login", templateVars);
  } else if (req.session["userId"] !== urlDatabase[toDelete].userId) {
    templateVars.error = "cannot delete links created by other users!";
    res.redirect("/urls", templateVars);
  } else {
    //console.log("deleting " + toDelete);
    delete urlDatabase[toDelete];
    res.redirect("/urls");
  }
});

//UPDATE URL ALREADY IN DATABASE
app.post("/urls/:shortURL/update", (req, res) => {
  const shortUrl = req.params.shortURL;
  const templateVars = {};

  if (!req.session) {
    templateVars.error = "not logged in - cannot update";
    res.redirect("login", templateVars);
  } else if (req.session.userId !== urlDatabase[shortUrl].userId) {
    templateVars.error = "cannot update links created by other users!";
    res.redirect("/urls", templateVars);
  } else {
    urlDatabase[shortUrl].longUrl = req.body.longURL;
    res.redirect("/urls");    
  }
});

//LOGIN BUTTON PRESS
app.post("/login", (req, res) => {
  const {email, password } = req.body;
  const templateVars = {};
  let userId = "";
  let status = undefined;
  //for loop continues through all users until email AND password match
  for (client in users) {
    if (users[client].email !== email) {
      status = 1;
    } else if (!bcrypt.compareSync(password, users[client].password)) {
      status = 2;
    } else if (bcrypt.compareSync(password, users[client].password)) {
      status = 0;
      userId = client;
      break;
    }
  }

  if (status === 1) {
    templateVars.error = "incorrect email";
    res.redirect("/login", templateVars);
  } else if (status === 2) {
    templateVars.error = "incorrect password";
    res.redirect("/login", templateVars);
  } else if (status === 0) {
    req.session.email = email;
    req.session.userId = userId;
    res.redirect("/urls");
  }
});

//LOGOUT BUTTON PRESS
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
