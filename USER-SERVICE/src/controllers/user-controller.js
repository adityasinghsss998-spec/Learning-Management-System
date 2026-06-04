const { UserService } = require('../services/user-service');
const userService = new UserService();

const getProfile = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        const name = req.headers['x-user-name'];
        const email = req.headers['x-user-email'];
        const role = req.headers['x-user-role'];
        const profile = await userService.getOrCreateProfile(userId, name, email, role);
        res.status(200).json(profile);
    } catch (e) {
        res.status(404).json({ message: e.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        const profile = await userService.updateProfile(userId, req.body);
        res.status(200).json(profile);
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
};

const updateAvatar = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        const avatarUrl = req.file?.location;
        if (!avatarUrl) throw new Error("No file uploaded");
        const profile = await userService.updateAvatar(userId, avatarUrl);
        res.status(200).json(profile);
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
};

module.exports = { getProfile, updateProfile, updateAvatar };