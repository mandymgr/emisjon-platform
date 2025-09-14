import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

interface ShareholderCSV {
  Date: string;
  Rank: string;
  Holding: string;
  Stake: string;
  ISIN: string;
  Name: string;
  Address: string;
  'Address 2': string;
  'Postal code': string;
  City: string;
  'Country of residence': string;
  Citizenship: string;
  'Type of account': string;
  'Email address': string;
  'Electronic communication': string;
  'Bank account dividend': string;
}

async function importShareholders() {
  try {
    console.log('Starting shareholder import...');
    
    // Read the CSV file
    const csvFilePath = path.join(process.cwd(), 'shareholders.csv');
    const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
    
    // Parse CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as ShareholderCSV[];
    
    console.log(`Found ${records.length} shareholders to import`);
    
    // Clear existing shareholders (optional - comment out if you want to append)
    await prisma.shareholder.deleteMany();
    console.log('Cleared existing shareholders');
    
    // Import each shareholder
    let successCount = 0;
    let errorCount = 0;
    
    for (const record of records) {
      try {
        // Extract and clean the data
        const name = record.Name.replace(/"/g, '').trim();
        const email = record['Email address'].trim().toLowerCase();
        const sharesOwned = parseInt(record.Holding.replace(/,/g, ''), 10) || 0;
        
        // Skip if no email
        if (!email || email === '') {
          console.log(`Skipping shareholder ${name} - no email`);
          continue;
        }
        
        // Check if shareholder already exists
        const existingShareholder = await prisma.shareholder.findUnique({
          where: { email }
        });
        
        if (existingShareholder) {
          // Update existing shareholder
          await prisma.shareholder.update({
            where: { email },
            data: {
              name,
              sharesOwned,
            }
          });
          console.log(`Updated shareholder: ${name} (${email})`);
        } else {
          // Create new shareholder
          await prisma.shareholder.create({
            data: {
              name,
              email,
              sharesOwned,
            }
          });
          console.log(`Created shareholder: ${name} (${email})`);
        }
        
        successCount++;
      } catch (error) {
        console.error(`Error processing shareholder ${record.Name}:`, error);
        errorCount++;
      }
    }
    
    console.log('\n=== Import Summary ===');
    console.log(`Total records: ${records.length}`);
    console.log(`Successfully imported: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
    
    // Display total shares
    const totalShares = await prisma.shareholder.aggregate({
      _sum: {
        sharesOwned: true,
      },
    });
    
    console.log(`Total shares in database: ${totalShares._sum.sharesOwned || 0}`);
    
  } catch (error) {
    console.error('Fatal error during import:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
importShareholders()
  .then(() => {
    console.log('Import completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Import failed:', error);
    process.exit(1);
  });