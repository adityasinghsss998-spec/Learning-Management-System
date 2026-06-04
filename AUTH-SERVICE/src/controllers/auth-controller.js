const {Authservice}=require('../services/auth-service');
const authservice=new Authservice();
const register = async (req, res) => {
  try {
    const result = await authservice.register(req.body.name, req.body.email, req.body.password, req.body.role);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const result = await authservice.login(req.body.email, req.body.password);
    res.status(200).json(result);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

const refresh = async (req, res) => {
  try {
    const result = await authservice.refresh(req.body.refreshToken);
    res.status(200).json(result);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};
const logout = async (req, res) => {
  try {
    
    await authservice.logout(req.body.id);
    res.status(200).json({ message: "Logged out" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
module.exports = { register, login, refresh, logout };
