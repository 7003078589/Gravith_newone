const { query } = require('../config/database');

class User {
  static async create(userData) {
    const {
      username,
      email,
      first_name,
      last_name,
      role = 'user',
      organization_id,
      organization_role = 'user',
      is_active = true,
    } = userData;

    const result = await query(
      `INSERT INTO users (username, email, first_name, last_name, role, organization_id, organization_role, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [username, email, first_name, last_name, role, organization_id, organization_role, is_active],
    );

    return result.rows[0];
  }

  static async findById(id) {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }

  static async findByUsername(username) {
    const result = await query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0];
  }

  static async findByOrganization(organizationId) {
    const result = await query(
      'SELECT * FROM users WHERE organization_id = $1 ORDER BY created_at DESC',
      [organizationId],
    );
    return result.rows;
  }

  static async update(id, updateData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const result = await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values,
    );

    return result.rows[0];
  }

  static async delete(id) {
    const result = await query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  static async getWithOrganization(id) {
    const result = await query(
      `SELECT u.*, o.name as organization_name, o.subscription as organization_subscription
       FROM users u
       JOIN organizations o ON u.organization_id = o.id
       WHERE u.id = $1`,
      [id],
    );
    return result.rows[0];
  }
}

module.exports = User;
