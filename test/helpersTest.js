const chai = require('chai');
const assert = chai.assert;
const { getUserByEmailId } = require('../views/helpers/helpers.js');

const testUsers = {
    "8O6nO1": {
        id: '8O6nO1',
        email: 'test@gmail.com',
        password: '$2b$10$JlZmr08Ye1E38ocxJuT8hOuUQUSKJO47MX5t/1.4816nxwlRfLzPy'
    },
    "QQxsUG": {
        id: "QQxsUG",
        email: "demo@gmail.com",
        password: "$2b$10$bFx8wqot69EuCJ4S8D/cculXI0e4F/RpC3vYTHdt5NVokwgEkB8gO"
    }
};

describe('getUserByEmailId', function () {
    it('should return a user with valid email', function () {
        const user = getUserByEmailId(testUsers, "test@gmail.com");
        const expectedOutput = "8O6nO1";
        assert.strictEqual(user.id, expectedOutput);
    });

    it('should return a undefined for non-existent  email', function () {
        const user = getUserByEmailId(testUsers, "test@example.com");
        console.log(user);
        const expectedOutput = undefined;
        assert.strictEqual(user, expectedOutput);
    });
});