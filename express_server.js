const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": { longUrl: "www.lighthouselabs.ca", userId: "testUser" },
  "9sm5xK": { longUrl: "www.google.com", userId: "testUser2" }
};

const users = {
  testUser: {
    id: "testUser",
    email: "aaaa@aaaa.com",
    password: "test"
  }
};

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  let templateVars = {};

  if (req.cookies["userId"]) {
    templateVars.loggedIn = true;
    templateVars.email = req.cookies["userId"].email;
    templateVars.userId = req.cookies["userId"].id;
    templateVars.urls = {};
    
    for (let url in urlDatabase) {
      if (urlDatabase[url].userId === req.cookies["userId"].id) {
        templateVars.urls[url] = urlDatabase[url];
      }
    }

    res.render("urls_index", templateVars);
  } else {
    console.log("not logged in - redirecting1")
    templateVars.userId = null;
    res.render("login", templateVars);
  }

});

app.get("/urls/new", (req, res) => {
  let templateVars = {};

  if (!req.cookies.email) {
    templateVars.userId = null;
    console.log("not logged in - redirecting");
    res.render("login", templateVars);
  } else {  
    templateVars.loggedIn = true;
    templateVars.email = req.cookies["email"];
    templateVars.userId = req.cookies["userId"];
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  let shortUrl = req.params.shortURL;
  let longUrl = urlDatabase[shortUrl].longUrl;
  let templateVars = {
    shortUrl,
    longUrl
  };

  if (req.cookies.email) {
    templateVars.loggedIn = true;
    templateVars.email = req.cookies["email"];
    templateVars.userId = req.cookies["userId"];
  } else {
    templateVars.loggedIn = false;
    templateVars.email = false;
    templateVars.userId = false;
  }

  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = "http\://" + urlDatabase[req.params.shortURL].longUrl;
  console.log(longURL);
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  let templateVars = {
    userId: null
  };

  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = {
    userId: null
  };
  console.log("redirected to login...");
  res.render("login", templateVars);
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
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

  res
    .cookie("userId", userId)
    .cookie("email", email);
  res.redirect("/urls/");
});

app.post("/urls", (req, res) => {
  if (!req.cookies.userId) {
    res.redirect("/urls/");
  }
  let newURL = generateRandomString();
  console.log(req.body.longURL + req.cookies);
  urlDatabase[newURL] = { longUrl: req.body.longURL, userId: req.cookies.userId };
  res.redirect(301, `/urls/${newURL}`);
});


app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`)
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const toDelete = req.params.shortURL;
  if (!req.cookies) {
    console.log("not logged in - cannot delete");
    res.redirect("login");
  } else if (req.cookies["userId"] !== urlDatabase[toDelete].userId) {
    console.log("cannot delete links created by other users!");
    res.redirect("/urls");
  } else {
    console.log("deleting " + toDelete);
    delete urlDatabase[toDelete];
    res.redirect("/urls");
  }
});

app.post("/urls/:shortURL/update", (req, res) => {
  const shortUrl = req.params.shortURL;
  if (!req.cookies) {
    console.log("not logged in - cannot update");
    res.redirect("login");
  } else if (req.cookies.userId.id !== urlDatabase[shortUrl].userId) {
    console.log(req.cookies.userId.id + " " + shortUrl + " " + urlDatabase[shortUrl].userId);
    console.log("cannot update links created by other users!");
    res.redirect("/urls");
  } else {
    urlDatabase[shortUrl].longUrl = req.body.longURL;
    console.log("updated URL successfully");
    res.redirect("/urls");    
  }
});

app.post("/login", (req, res) => {
  const {email, password } = req.body;
  
  for (client in users) {
    if (!users[client].email) {
      res.redirect("/urls");
    } else if (users[client].email && users[client].password !== password) {
      res.redirect("/urls");
    } else if (users[client].email && users[client].password === password) {
      res
        .cookie("email", email)
        .cookie("userId", users[client]);

      console.log('email is ' + req.body.email);
      res.redirect("/urls");
    }
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("email");
  res.clearCookie("userId");
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
