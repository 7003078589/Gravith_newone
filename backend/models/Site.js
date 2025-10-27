const { query } = require('../config/database');

class Site {
  static async create(siteData) {
    const {
      name,
      location,
      status = 'active',
      start_date,
      end_date,
      expected_end_date,
      budget = 0,
      spent = 0,
      description,
      progress = 0,
      organization_id,
    } = siteData;

    const result = await query(
      `INSERT INTO sites (name, location, status, start_date, end_date, expected_end_date, budget, spent, description, progress, organization_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        name,
        location,
        status,
        start_date,
        end_date,
        expected_end_date,
        budget,
        spent,
        description,
        progress,
        organization_id,
      ],
    );

    return result.rows[0];
  }

  static async findById(id) {
    const result = await query('SELECT * FROM sites WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async findByOrganization(organizationId) {
    const result = await query(
      'SELECT * FROM sites WHERE organization_id = $1 ORDER BY created_at DESC',
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
      `UPDATE sites SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values,
    );

    return result.rows[0];
  }

  static async delete(id) {
    const result = await query('DELETE FROM sites WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  static async getSiteStats(organizationId) {
    const result = await query(
      `SELECT 
         COUNT(*) as total_sites,
         COUNT(CASE WHEN status = 'active' THEN 1 END) as active_sites,
         COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_sites,
         SUM(budget) as total_budget,
         SUM(spent) as total_spent
       FROM sites 
       WHERE organization_id = $1`,
      [organizationId],
    );
    return result.rows[0];
  }
}

module.exports = Site;
