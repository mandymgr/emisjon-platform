import prisma from '../config/database';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

interface CreateShareholderDTO {
  name: string;
  email: string;
  phone?: string;
  sharesOwned: number;
  userId?: string;
}

interface UpdateShareholderDTO {
  name?: string;
  email?: string;
  phone?: string;
  sharesOwned?: number;
  userId?: string | null;
}

// Get all shareholders
export async function getAllShareholders() {
  const shareholders = await prisma.shareholder.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          level: true
        }
      }
    },
    orderBy: {
      sharesOwned: 'desc'
    }
  });

  return shareholders;
}

// Get shareholder by ID
export async function getShareholderById(id: string) {
  const shareholder = await prisma.shareholder.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          level: true
        }
      }
    }
  });

  if (!shareholder) {
    throw new Error('Shareholder not found');
  }

  return shareholder;
}

// Create a new shareholder
export async function createShareholder(data: CreateShareholderDTO) {
  const emailLower = data.email.toLowerCase();
  
  // Check if shareholder with this email already exists
  const existingShareholderByEmail = await prisma.shareholder.findUnique({
    where: { email: emailLower }
  });

  if (existingShareholderByEmail) {
    throw new Error('A shareholder with this email already exists');
  }

  // Check if user with this email exists
  let user = await prisma.user.findUnique({
    where: { email: emailLower }
  });

  let userId = data.userId;
  let createdNewUser = false;

  // If no user exists with this email, create one
  if (!user) {
    // Generate a random password
    const randomPassword = crypto.randomBytes(12).toString('base64');
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Create the user account
    user = await prisma.user.create({
      data: {
        email: emailLower,
        password: hashedPassword,
        name: data.name,
        phone: data.phone,
        role: 'USER',
        level: 1,
        isActive: true
      }
    });

    userId = user.id;
    createdNewUser = true;
    
    console.log(`Created new user for shareholder ${emailLower} with temporary password`);
    // In production, you would send an email with password reset link
  } else {
    // User exists, use their ID
    userId = user.id;
    
    // Check if this user is already linked to another shareholder
    const existingShareholderByUser = await prisma.shareholder.findFirst({
      where: { userId: user.id }
    });

    if (existingShareholderByUser) {
      throw new Error('This user is already linked to a shareholder');
    }
  }

  // If userId was explicitly provided, validate it matches
  if (data.userId && data.userId !== userId) {
    throw new Error('Provided userId does not match the user with this email');
  }

  const shareholder = await prisma.shareholder.create({
    data: {
      name: data.name,
      email: emailLower,
      phone: data.phone,
      sharesOwned: data.sharesOwned,
      userId: userId
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          level: true
        }
      }
    }
  });

  // Update ownership percentages for all shareholders
  await updateOwnershipPercentages();

  return {
    ...shareholder,
    newUserCreated: createdNewUser
  };
}

// Update a shareholder
export async function updateShareholder(id: string, data: UpdateShareholderDTO) {
  // Check if shareholder exists
  const existingShareholder = await prisma.shareholder.findUnique({
    where: { id }
  });

  if (!existingShareholder) {
    throw new Error('Shareholder not found');
  }

  // If email is being updated, check for duplicates
  if (data.email && data.email !== existingShareholder.email) {
    const emailExists = await prisma.shareholder.findUnique({
      where: { email: data.email }
    });

    if (emailExists) {
      throw new Error('A shareholder with this email already exists');
    }
  }

  // If userId is being updated, validate it
  if (data.userId !== undefined) {
    if (data.userId) {
      const user = await prisma.user.findUnique({
        where: { id: data.userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      const existingShareholderByUser = await prisma.shareholder.findFirst({
        where: { 
          userId: data.userId,
          NOT: { id }
        }
      });

      if (existingShareholderByUser) {
        throw new Error('This user is already linked to another shareholder');
      }
    }
  }

  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email.toLowerCase();
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.sharesOwned !== undefined) updateData.sharesOwned = data.sharesOwned;
  if (data.userId !== undefined) updateData.userId = data.userId;

  const shareholder = await prisma.shareholder.update({
    where: { id },
    data: updateData,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          level: true
        }
      }
    }
  });

  // Update ownership percentages if shares were changed
  if (data.sharesOwned !== undefined) {
    await updateOwnershipPercentages();
  }

  return shareholder;
}

// Delete a shareholder
export async function deleteShareholder(id: string) {
  // Check if shareholder exists
  const shareholder = await prisma.shareholder.findUnique({
    where: { id }
  });

  if (!shareholder) {
    throw new Error('Shareholder not found');
  }

  // Delete the shareholder
  await prisma.shareholder.delete({
    where: { id }
  });

  // Update ownership percentages after deletion
  await updateOwnershipPercentages();

  return { message: 'Shareholder deleted successfully' };
}

// Get shareholder statistics
export async function getShareholderStats() {
  const totalShareholders = await prisma.shareholder.count();
  
  const totalShares = await prisma.shareholder.aggregate({
    _sum: {
      sharesOwned: true
    }
  });

  const topShareholders = await prisma.shareholder.findMany({
    take: 10,
    orderBy: {
      sharesOwned: 'desc'
    },
    select: {
      id: true,
      name: true,
      email: true,
      sharesOwned: true
    }
  });

  return {
    totalShareholders,
    totalShares: totalShares._sum.sharesOwned || 0,
    topShareholders
  };
}

// Update ownership percentages for all shareholders
export async function updateOwnershipPercentages() {
  try {
    // Get all shareholders
    const shareholders = await prisma.shareholder.findMany();
    
    // Calculate total shares
    const totalShares = shareholders.reduce((sum, shareholder) => sum + shareholder.sharesOwned, 0);
    
    if (totalShares === 0) {
      // If no shares exist, set all percentages to 0
      await prisma.shareholder.updateMany({
        data: {
          ownershipPercentage: 0
        }
      });
      return;
    }
    
    // Update each shareholder's ownership percentage
    for (const shareholder of shareholders) {
      const percentage = (shareholder.sharesOwned / totalShares) * 100;
      
      await prisma.shareholder.update({
        where: { id: shareholder.id },
        data: {
          ownershipPercentage: parseFloat(percentage.toFixed(2))
        }
      });
    }
    
    console.log('Ownership percentages updated successfully');
  } catch (error) {
    console.error('Error updating ownership percentages:', error);
    throw error;
  }
}

// Get total shares in the system
export async function getTotalShares(): Promise<number> {
  const result = await prisma.shareholder.aggregate({
    _sum: {
      sharesOwned: true
    }
  });
  
  return result._sum.sharesOwned || 0;
}

// Update a shareholder's shares and recalculate all percentages
export async function updateShareholderShares(
  shareholderId: string,
  newShares: number
): Promise<void> {
  try {
    // Update the shareholder's shares
    await prisma.shareholder.update({
      where: { id: shareholderId },
      data: {
        sharesOwned: newShares
      }
    });
    
    // Recalculate all ownership percentages
    await updateOwnershipPercentages();
  } catch (error) {
    console.error('Error updating shareholder shares:', error);
    throw error;
  }
}

// Add shares to a shareholder (used when approving subscriptions)
export async function addSharesToShareholder(
  shareholderId: string,
  additionalShares: number
): Promise<void> {
  try {
    const shareholder = await prisma.shareholder.findUnique({
      where: { id: shareholderId }
    });
    
    if (!shareholder) {
      throw new Error('Shareholder not found');
    }
    
    const newTotal = shareholder.sharesOwned + additionalShares;
    await updateShareholderShares(shareholderId, newTotal);
  } catch (error) {
    console.error('Error adding shares to shareholder:', error);
    throw error;
  }
}