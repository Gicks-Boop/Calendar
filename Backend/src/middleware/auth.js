import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

export const authenticate = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Acceso no autorizado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [user] = await pool.query('SELECT * FROM users WHERE id = ?', [decoded.id]);
    
    if (!user) {
      throw new Error();
    }

    req.user = user[0];
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};