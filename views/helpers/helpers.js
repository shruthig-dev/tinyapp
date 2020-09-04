const createUser = (userObj, id, email, password) => {
  userObj[id] = {
    id,
    email,
    password,
  };
};
const checkPassword = (bcrypt, userObj, formPassword) => {
  const storedPassword = userObj ? userObj.password : '';
  return bcrypt.compareSync(formPassword, storedPassword);
};
const getUserByEmailId = (userObj, email) => {
  let userData ;
  for (const key in userObj) {
    if (userObj.hasOwnProperty(key)) {
      const userEmail = userObj[key].email;
      if (email === userEmail) {
        userData = userObj[key];
        return userData;
      }
    }
  }
  return userData;
};

const checkIfUserCookieExists = (UserCookie) => {
  if (UserCookie === undefined || null) {
    return false;
  }
  else {
    return true;
  }
};

const authorizeUser = (urlUserId, loggedInUserId) => {
    if (urlUserId && loggedInUserId && loggedInUserId === urlUserId) {
      return true;
    }
    else {
      return false;
    }
};

const geturlsForUser = (urlDatabase, userId) => {
  let listOfUrls = {};

  for (const key in urlDatabase) {
    if (urlDatabase.hasOwnProperty(key)) {
      if (urlDatabase[key].userID === userId) {
        listOfUrls[key] = urlDatabase[key];
      }
    }
  }
  return (listOfUrls);
};

module.exports = { createUser, getUserByEmailId, checkPassword, authorizeUser, geturlsForUser,checkIfUserCookieExists };
