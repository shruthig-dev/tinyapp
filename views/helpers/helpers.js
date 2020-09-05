/*
-----Conatins Helper methods used in Tiny app----
createUser: Create new user object
Generate randomString while creating userId , UrlId
formatUrl : append http at the starting of the url text if not entered
checkPassword: Verify user password with stored password
getUserByEmailId : pass emailId and get user data object
checkIfUserCookieExists : if cookies data is null and user try to access url from browserURL tab
authorizeUser : check to verify if unauthorized user try to access url 
geturlsForUser : Filter URL data based on loggedIn user
*/
const createUser = (userObj, id, email, password) => {
  userObj[id] = {
    id,
    email,
    password,
  };
};

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

const checkPassword = (bcrypt, userObj, formPassword) => {
  const storedPassword = userObj ? userObj.password : '';
  return bcrypt.compareSync(formPassword, storedPassword);
};
const getUserByEmailId = (userObj, email) => {
  let userData = null;
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

module.exports = { createUser, getUserByEmailId, checkPassword, authorizeUser, geturlsForUser, checkIfUserCookieExists, generateRandomString, formatUrl };
