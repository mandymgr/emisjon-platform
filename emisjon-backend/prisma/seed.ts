import { PrismaClient } from '@prisma/client';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface CSVRow {
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

function parseStake(stake: string): number {
  // Convert "70,51%" to 70.51
  return parseFloat(stake.replace(',', '.').replace('%', ''));
}

function parseHolding(holding: string): number {
  // Convert "90 000" to 90000
  return parseInt(holding.replace(/\s/g, ''), 10);
}

function determineShareholderType(name: string): 'INDIVIDUAL' | 'COMPANY' {
  // Check if name contains company indicators
  const companyIndicators = ['AS', 'ASA', 'ANS', 'DA', 'BA', 'NUF', 'SA', 'Ltd', 'Inc', 'GmbH', 'AG'];
  return companyIndicators.some(indicator => name.includes(indicator)) ? 'COMPANY' : 'INDIVIDUAL';
}

function parseEventType(eventLabel: string): 'EMISSION' | 'TRANSACTION' | 'LIVE_REGISTER' {
  const label = eventLabel.toLowerCase();
  if (label.includes('stiftelse') || label.includes('pre-seed') || label.includes('seed') || label.includes('series')) {
    return 'EMISSION';
  }
  if (label.includes('transaksjon')) {
    return 'TRANSACTION';
  }
  return 'LIVE_REGISTER';
}

async function importCSVSnapshot(filePath: string) {
  console.log(`📁 Reading CSV file: ${filePath}`);
  
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split('\n').filter(line => line.trim());
  
  // Parse header rows
  const dateRow = lines[0].split(',');
  const eventRow = lines[1].split(',');
  
  // Find the first date and event (non-empty)
  const snapshotDate = dateRow.find(d => d.trim());
  const eventName = eventRow.find(e => e.trim());
  
  if (!snapshotDate || !eventName) {
    throw new Error('Could not find date or event name in CSV');
  }
  
  console.log(`📅 Snapshot Date: ${snapshotDate}`);
  console.log(`📌 Event: ${eventName}`);
  
  // Parse data rows (skip first 3 header rows)
  const dataRows = lines.slice(3);
  const csvData = parse(dataRows.join('\n'), {
    columns: true,
    skip_empty_lines: true,
    delimiter: ','
  }) as CSVRow[];
  
  console.log(`📊 Found ${csvData.length} shareholder records`);
  
  // Calculate total shares for this snapshot
  const totalShares = csvData.reduce((sum, row) => sum + parseHolding(row.Holding), 0);
  console.log(`💰 Total shares: ${totalShares.toLocaleString()}`);
  
  // Process each shareholder
  let processedCount = 0;
  
  for (const row of csvData) {
    try {
      // Skip empty rows
      if (!row.Name || !row.Holding) continue;
      
      const shareholderType = determineShareholderType(row.Name);
      const shares = parseHolding(row.Holding);
      const percentage = parseStake(row.Stake);
      
      // Create or update shareholder
      const shareholder = await prisma.shareholder.upsert({
        where: { 
          email: row['Email address'] || `placeholder-${row.Name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}@emisjon.no`
        },
        create: {
          name: row.Name,
          type: shareholderType,
          email: row['Email address'] || null,
          address: row.Address || null,
          address2: row['Address 2'] || null,
          postalCode: row['Postal code'] || null,
          city: row.City || null,
          countryOfResidence: row['Country of residence'] || null,
          citizenship: row.Citizenship || null,
          accountType: row['Type of account'] || 'Ordinary',
          electronicComm: row['Electronic communication'] === 'Yes',
          bankAccountDividend: row['Bank account dividend'] === 'Yes',
          currentShares: shares,
          currentPercentage: percentage,
          firstInvestedDate: new Date(snapshotDate.split('.').reverse().join('-'))
        },
        update: {
          // Update current holdings if this is the latest data
          currentShares: shares,
          currentPercentage: percentage,
        }
      });
      
      // Create snapshot entry
      const snapshotDateObj = new Date(snapshotDate.split('.').reverse().join('-'));
      
      await prisma.shareholderSnapshot.upsert({
        where: {
          shareholderId_snapshotDate: {
            shareholderId: shareholder.id,
            snapshotDate: snapshotDateObj
          }
        },
        create: {
          shareholderId: shareholder.id,
          snapshotDate: snapshotDateObj,
          eventType: parseEventType(eventName),
          eventName: eventName,
          rank: parseInt(row.Rank),
          shares: shares,
          percentage: percentage,
          totalShares: totalShares,
          isin: row.ISIN,
          source: 'CSV Import'
        },
        update: {
          rank: parseInt(row.Rank),
          shares: shares,
          percentage: percentage,
          totalShares: totalShares
        }
      });
      
      processedCount++;
      console.log(`✅ Processed: ${row.Name} - ${shares.toLocaleString()} shares (${percentage}%)`);
    } catch (error) {
      console.error(`❌ Error processing row for ${row.Name}:`, error);
    }
  }
  
  console.log(`\n🎉 Import complete! Processed ${processedCount} shareholders`);
  
  // If this is a founding event, create the emission record
  if (eventName.toLowerCase().includes('stiftelse')) {
    const emission = await prisma.emission.create({
      data: {
        name: 'Company Foundation',
        emissionType: 'PRE_SEED',
        emissionDate: new Date(snapshotDate.split('.').reverse().join('-')),
        sharesIssued: totalShares,
        pricePerShare: null,
        totalRaised: null,
        totalSharesAfter: totalShares,
        status: 'COMPLETED',
        notes: 'Initial company foundation - 100% to founder'
      }
    });
    
    console.log(`📈 Created emission record: ${emission.name}`);
  }
}

async function main() {
  console.log('🚀 Starting database seed...\n');
  
  try {
    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing data...');
    await prisma.shareholderSnapshot.deleteMany();
    await prisma.emissionParticipation.deleteMany();
    await prisma.emission.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.user.deleteMany();
    await prisma.shareholder.deleteMany();
    
    // Import CSV snapshot
    const csvPath = path.join(__dirname, '..', 'data.csv');
    await importCSVSnapshot(csvPath);
    
    // Create a test admin user
    console.log('\n👤 Creating test admin user...');
    const admin = await prisma.user.create({
      data: {
        email: 'admin@emisjon.no',
        password: '$2a$10$K7L1OmO7hx8Jc5.M3q3Y5eR5zK9V7xX3yJ2U4wZ8vN1mQ9pR6sT0i', // password: admin123
        role: 'ADMIN',
        accessLevel: 2, // Senior admin
        isVerified: true,
        verifiedAt: new Date()
      }
    });
    console.log(`✅ Admin user created: ${admin.email}`);
    
    console.log('\n✨ Seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });