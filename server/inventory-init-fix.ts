import { db } from "./db";
import { sql } from "drizzle-orm";

export class InventoryInitializationService {
  async initializeBasicTemplates(tenantId: number) {
    try {
      console.log(`Initializing inventory templates for tenant ${tenantId}`);
      
      // Create basic category
      const categoryResult = await db.execute(sql`
        INSERT INTO inventory_categories (tenant_id, name, description, is_active, created_at, updated_at)
        VALUES (${tenantId}, 'Laboratory Supplies', 'Basic laboratory consumables', true, NOW(), NOW())
        ON CONFLICT DO NOTHING
        RETURNING id
      `);

      // Get category ID
      const categoryQuery = await db.execute(sql`
        SELECT id FROM inventory_categories 
        WHERE name = 'Laboratory Supplies' AND tenant_id = ${tenantId}
        LIMIT 1
      `);
      
      const categoryId = categoryQuery.rows[0]?.id;
      
      if (!categoryId) {
        throw new Error('Failed to create or find category');
      }

      // Create basic inventory items
      const items = [
        { code: 'LAB-001', name: 'Blood Collection Tubes (EDTA)', unit: 'pieces' },
        { code: 'RAD-002', name: 'Contrast Agent (Barium)', unit: 'ml' },
        { code: 'LAB-003', name: 'Cover Slips', unit: 'pieces' }
      ];

      for (const item of items) {
        await db.execute(sql`
          INSERT INTO inventory_items (
            tenant_id, category_id, item_code, name, description,
            unit_of_measure, reorder_level, minimum_stock, maximum_stock,
            unit_cost, is_active, created_at, updated_at
          ) VALUES (
            ${tenantId}, ${categoryId}, ${item.code}, ${item.name},
            'Standard medical consumable', ${item.unit},
            10, 5, 1000, 1.00, true, NOW(), NOW()
          )
          ON CONFLICT (tenant_id, item_code) DO NOTHING
        `);
      }

      console.log('Successfully initialized inventory templates');
      return { success: true };
    } catch (error) {
      console.error('Error initializing inventory:', error);
      throw error;
    }
  }
}