const { query } = require('../config/database');

class Organization {
  static async create(organizationData) {
    const {
      name,
      logo_url,
      subscription = 'free',
      is_active = true,
      created_by,
    } = organizationData;

    const result = await query(
      `INSERT INTO organizations (name, logo_url, subscription, is_active, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, logo_url, subscription, is_active, created_by],
    );

    return result.rows[0];
  }

  static async findById(id) {
    const result = await query('SELECT * FROM organizations WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const result = await query(
      `SELECT o.* FROM organizations o
       JOIN users u ON o.id = u.organization_id
       WHERE u.id = $1`,
      [userId],
    );
    return result.rows[0];
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
      `UPDATE organizations SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values,
    );

    return result.rows[0];
  }

  static async delete(id) {
    const result = await query('DELETE FROM organizations WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  static async getAll() {
    const result = await query('SELECT * FROM organizations ORDER BY created_at DESC');
    return result.rows;
  }
}

module.exports = Organization;
