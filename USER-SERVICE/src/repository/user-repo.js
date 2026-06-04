const User = require('../models/user');

class Userrepository {
    async create(data) {
        try {
            const user = await User.create(data);
            return user;
        } catch (e) {
            console.log("Something went wrong at the repo layer", e);
            throw e;
        }
    }

    async findByUserId(userId) {
        try {
            const user = await User.findOne({ userId });
            return user;
        } catch (e) {
            console.log("Something went wrong at the repo layer", e);
            throw e;
        }
    }

    async updateByUserId(userId, data) {
        try {
            const user = await User.findOneAndUpdate(
                { userId },
                data,
                { new: true }
            );
            return user;
        } catch (e) {
            console.log("Something went wrong at the repo layer", e);
            throw e;
        }
    }
}

module.exports = { Userrepository };