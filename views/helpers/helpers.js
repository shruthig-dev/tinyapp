
const createUser = (userObj, id, email, password) => {

    userObj[id] = {
        id,
        email,
        password
    }
}
const checkPassword = (bcrypt, userObj, formPassword) => {
    const storedPassword = userObj ? userObj.password : "";
    return bcrypt.compareSync(formPassword, storedPassword)
}
const getUserByEmailId = (userObj, email) => {

    for (const key in userObj) {
        if (userObj.hasOwnProperty(key)) {
            const userEmail = userObj[key].email;
            if (email === userEmail) {
                return userObj[key];
            }

        }
    }
    return null;
}


module.exports = { createUser, getUserByEmailId, checkPassword }