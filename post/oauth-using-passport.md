---
layout: post.njk
title: OAuth using Passport.js
date: 2018-06-08
tags: ["post"]
description: Passport.js is a middleware which implements authentication on Express-based web applications. It provides over 500+ strategies. What are these strategies? Strategies are used to authenticate requests.
---

![Lock](../../img/lock.jpg)

## What is OAuth?

OAuth (Open Authorization) is an authorization protocol. A third party application can use it to access user data from a site (like Google or Twitter) without revealing their password. Sites like Quora, Medium, AirBnb and many others offer authentication using OAuth.

OAuth really makes our lives simpler by eliminating the need to remember the password of every account you create on almost any site. You just have to remember your OAuth provider’s main account password.

## What is Passport.js?

<a href="http://www.passportjs.org" target="_blank" rel="noreferrer">Passport</a> is a middleware which implements authentication on Express-based web applications. It provides over 500+ strategies. What are these strategies? Strategies are used to authenticate requests. Each strategy has its own npm package (such as <a href="https://www.npmjs.com/package/passport-twitter" target="_blank" rel="noreferrer">passport-twitter</a>, <a href="https://www.npmjs.com/package/passport-google-oauth20" target="_blank" rel="noreferrer">passport-google-oauth20</a>). A strategy must be configured before usage.

Why use Passport.js?

Here are six reasons stating why you should use Passport:

- It is lightweight
- Easily configurable
- Supports persistent sessions
- Offers OAuth
- Provides separate modules for each strategy
- Gives you the ability to implement custom strategies

## Let’s build something

To get started, we need to install passport from NPM:

```bash
npm install passport
```

We are going to build a simple app which grants the user access to a secret route only if they log in. I’m going to be using the <a href="https://www.npmjs.com/package/passport-google-oauth20" target="_blank" rel="noreferrer">passport-google-oauth20</a> strategy in this tutorial. Feel free to use any other strategy you prefer, but make sure to check the docs to see how it is configured.

Before continuing, we need a clientID and clientSecret. To get one, head over to <a href="https://console.developers.google.com" target="_blank" rel="noreferrer">Google API console</a> and create a new project. Then go to Enable APIs and Services and enable the Google+ API. Select the API and click on create credentials.

Fill out the form and use the same callback URL on both the form and on your file. Make sure to read the comments on the code to figure out how everything fits together.

### app.js

```javascript
// Required dependencies
const express = require("express");
const app = express();
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const cookieSession = require("cookie-session");

// cookieSession config
app.use(
  cookieSession({
    maxAge: 24 * 60 * 60 * 1000, // One day in milliseconds
    keys: ["randomstringhere"],
  })
);

app.use(passport.initialize()); // Used to initialize passport
app.use(passport.session()); // Used to persist login sessions

// Strategy config
passport.use(
  new GoogleStrategy(
    {
      clientID: "YOUR_CLIENTID_HERE",
      clientSecret: "YOUR_CLIENT_SECRET_HERE",
      callbackURL: "http://localhost:8000/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      done(null, profile); // passes the profile data to serializeUser
    }
  )
);

// Used to stuff a piece of information into a cookie
passport.serializeUser((user, done) => {
  done(null, user);
});

// Used to decode the received cookie and persist session
passport.deserializeUser((user, done) => {
  done(null, user);
});

// Middleware to check if the user is authenticated
function isUserAuthenticated(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.send("You must login!");
  }
}

// Routes
app.get("/", (req, res) => {
  res.render("index.ejs");
});

// passport.authenticate middleware is used here to authenticate the request
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile"], // Used to specify the required data
  })
);

// The middleware receives the data from Google and runs the function on Strategy config
app.get(
  "/auth/google/callback",
  passport.authenticate("google"),
  (req, res) => {
    res.redirect("/secret");
  }
);

// Secret route
app.get("/secret", isUserAuthenticated, (req, res) => {
  res.send("You have reached the secret route");
});

// Logout route
app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

app.listen(8000, () => {
  console.log("Server Started!");
});
```

### index.ejs

```html
<ul>
  <li><a href="/auth/google">Login</a></li>
  <li><a href="/secret">Secret</a></li>
  <li><a href="/logout">Logout</a></li>
</ul>
```

As you can see, we’ve created a /secret route, and only grant access to it if the user is authenticated. To verify whether the user is authenticated, we’ve created a middleware which checks if the request has the user object in it. Finally, to log out we used the req.logout() method provided by passport to clear the session.

## Conclusion

We only saw one strategy here. There are 500+ more. I highly recommend that you skim through Passport’s official <a href="http://www.passportjs.org/docs/" target="_blank" rel="noreferrer">documentation</a> and find out what else they offer.
