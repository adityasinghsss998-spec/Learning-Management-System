const { Userrepository } = require('../repository/user-repo');

class UserService {
    constructor() {
        this.repo = new Userrepository();
    }

    async getOrCreateProfile(userId, name, email, role) {
        try {
            let user = await this.repo.findByUserId(userId);
            if (!user) {
                user = await this.repo.create({ userId, name, email, role });
            }
            return user.toPublicProfile();
        } catch (e) {
            console.log("Something went wrong at the service layer", e);
            throw e;
        }
    }

    async getProfile(userId) {
        try {
            const user = await this.repo.findByUserId(userId);
            if (!user) throw new Error("Profile not found");
            return user.toPublicProfile();
        } catch (e) {
            console.log("Something went wrong at the service layer", e);
            throw e;
        }
    }

    async updateProfile(userId, updates) {
        try {
            const user = await this.repo.updateByUserId(userId, updates);
            if (!user) throw new Error("Profile not found");
            return user.toPublicProfile();
        } catch (e) {
            console.log("Something went wrong at the service layer", e);
            throw e;
        }
    }

    async updateAvatar(userId, avatarUrl) {
        try {
            const user = await this.repo.updateByUserId(userId, { avatar: avatarUrl });
            if (!user) throw new Error("Profile not found");
            return user.toPublicProfile();
        } catch (e) {
            console.log("Something went wrong at the service layer", e);
            throw e;
        }
    }
}

module.exports = { UserService };