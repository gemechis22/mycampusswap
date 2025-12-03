import { register, login } from '../services/authService.js';

export async function handleRegister(req, res) {
  try {
    const { email, displayName, password, role } = req.body;
    const user = await register({ email, displayName, password, role });
    res.status(201).json({ user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function handleLogin(req, res) {
  try {
    const { email, password } = req.body;
    const result = await login({ email, password });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
