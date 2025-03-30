import pool from '../config/db.js';

export default class Event {
  static async create({ userId, title, date, time, color, category }) {
    const [result] = await pool.query(`
      INSERT INTO events 
      (user_id, title, date, time, color, category, year, month, day)
      VALUES (?, ?, ?, ?, ?, ?, YEAR(?), MONTH(?), DAY(?))
    `, [userId, title, date, time, color, category, date, date, date]);

    return result.insertId;
  }

  static async findByUser(userId, startDate, endDate) {
    const [rows] = await pool.query(`
      SELECT * FROM events 
      WHERE user_id = ? AND date BETWEEN ? AND ?
      ORDER BY date, time
    `, [userId, startDate, endDate]);

    return rows;
  }
}