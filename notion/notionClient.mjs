// notion/notionClient.js
import { Client } from '@notionhq/client';
import dotenv from 'dotenv';
dotenv.config();

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DB_ID;

export async function fetchInventory() {
  const response = await notion.databases.query({ database_id: databaseId });
  return response.results.map(page => {
    return {
      id: page.id,
      Name: page.properties.Name.title[0]?.plain_text || 'Untitled',
      SKU: page.properties.SKU.rich_text[0]?.plain_text || '',
      Category: page.properties.Category.multi_select.map(tag => tag.name),
      Price: page.properties.Price.number || 0,
      Number: page.properties.Number.number || 0
    };
  });
}

export async function recordSale(sku, quantity) {
  const pages = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: 'SKU',
      rich_text: {
        equals: sku
      }
    }
  });

  if (pages.results.length === 0) throw new Error('SKU not found');
  const page = pages.results[0];
  const currentQty = page.properties.Number.number || 0;
  const newQty = Math.max(0, currentQty - quantity);

  await notion.pages.update({
    page_id: page.id,
    properties: {
      Number: {
        number: newQty
      }
    }
  });

  return { newQty };
}
