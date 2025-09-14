import { Response } from 'express';
import { validationResult } from 'express-validator';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/authMiddleware';
import { createAuditLog } from '../services/auditService';
import { createShareholderSnapshot } from '../services/snapshotService';

// Get all emissions
export const getAllEmissions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userRole = req.userRole;
    const userLevel = req.userLevel || 1;
    
    // Only admins and level 3 users can view emissions
    if (userRole !== 'ADMIN' && userLevel < 3) {
      res.status(403).json({ error: 'Access denied. Level 3+ required.' });
      return;
    }

    const whereClause: any = {};
    
    // If user is not admin, only show active emissions
    if (userRole !== 'ADMIN') {
      whereClause.status = 'ACTIVE';
    }

    const emissions = await prisma.emission.findMany({
      where: whereClause,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(emissions);
  } catch (error) {
    console.error('Error fetching emissions:', error);
    res.status(500).json({ error: 'Failed to fetch emissions' });
  }
};

// Get emission by ID
export const getEmissionById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const userRole = req.userRole;
    const userLevel = req.userLevel || 1;
    
    // Only admins and level 3 users can view emissions
    if (userRole !== 'ADMIN' && userLevel < 3) {
      res.status(403).json({ error: 'Access denied. Level 3+ required.' });
      return;
    }

    const { id } = req.params;

    const emission = await prisma.emission.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!emission) {
      res.status(404).json({ error: 'Emission not found' });
      return;
    }

    // Non-admins can only see active emissions
    if (userRole !== 'ADMIN' && emission.status !== 'ACTIVE') {
      res.status(403).json({ error: 'Access denied to this emission' });
      return;
    }

    res.json(emission);
  } catch (error) {
    console.error('Error fetching emission:', error);
    res.status(500).json({ error: 'Failed to fetch emission' });
  }
};

// Create emission
export const createEmission = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const userRole = req.userRole;
    const userId = req.userId;
    
    // Only admins can create emissions
    if (userRole !== 'ADMIN') {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const {
      title,
      description,
      sharesBefore,
      newSharesOffered,
      pricePerShare,
      startDate,
      endDate,
      status
    } = req.body;

    // Convert string values to proper types (needed when using FormData)
    const sharesBeforeNum = parseInt(sharesBefore);
    const newSharesOfferedNum = parseInt(newSharesOffered);
    const pricePerShareNum = parseFloat(pricePerShare);

    // Validate conversions
    if (isNaN(sharesBeforeNum) || isNaN(newSharesOfferedNum) || isNaN(pricePerShareNum)) {
      res.status(400).json({ error: 'Invalid numeric values provided' });
      return;
    }

    // Validate end date is after start date
    if (new Date(endDate) <= new Date(startDate)) {
      res.status(400).json({ error: 'End date must be after start date' });
      return;
    }

    // Calculate sharesAfter
    const sharesAfter = sharesBeforeNum + newSharesOfferedNum;

    // Handle file upload - Cloudinary returns the URL in req.file
    let presentationFileUrl: string | undefined = undefined;
    if (req.file) {
      console.log('Full file object from Cloudinary:', JSON.stringify(req.file, null, 2)); // Debug log
      // multer-storage-cloudinary stores the URL in the 'path' property
      const cloudinaryFile = req.file as any;
      presentationFileUrl = cloudinaryFile.path || 
                           cloudinaryFile.secure_url || 
                           cloudinaryFile.url;
      
      // If no URL found, try to construct from filename
      if (!presentationFileUrl && cloudinaryFile.filename) {
        // The filename contains the full path in Cloudinary
        presentationFileUrl = cloudinaryFile.filename;
      }
      
      // Ensure we have the secure URL format
      if (presentationFileUrl && !presentationFileUrl.startsWith('https://')) {
        // If it's just a public_id, construct the full URL
        presentationFileUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${presentationFileUrl}`;
      }
      
      console.log('Final Presentation File URL:', presentationFileUrl); // Debug log
      
      if (!presentationFileUrl) {
        console.error('Failed to get URL from Cloudinary upload:', req.file);
      }
    }

    const emission = await prisma.emission.create({
      data: {
        title,
        description,
        presentationFileUrl,
        sharesBefore: sharesBeforeNum,
        newSharesOffered: newSharesOfferedNum,
        sharesAfter,
        pricePerShare: pricePerShareNum,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: status || 'PREVIEW', // Default to PREVIEW as per spec
        createdById: userId
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json(emission);
  } catch (error) {
    console.error('Error creating emission:', error);
    res.status(500).json({ error: 'Failed to create emission' });
  }
};

// Update emission
export const updateEmission = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const userRole = req.userRole;
    
    // Only admins can update emissions
    if (userRole !== 'ADMIN') {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const { id } = req.params;
    const updateData: any = {};

    // Only add fields that were provided
    const fields = [
      'title', 'description',
      'sharesBefore', 'newSharesOffered', 'pricePerShare',
      'status'
    ];

    fields.forEach(field => {
      if (req.body[field] !== undefined && req.body[field] !== '') {
        // Convert string values to proper types when using FormData
        if (field === 'sharesBefore' || field === 'newSharesOffered') {
          const parsed = parseInt(req.body[field]);
          if (!isNaN(parsed)) {
            updateData[field] = parsed;
          }
        } else if (field === 'pricePerShare') {
          const parsed = parseFloat(req.body[field]);
          if (!isNaN(parsed)) {
            updateData[field] = parsed;
          }
        } else {
          updateData[field] = req.body[field];
        }
      }
    });

    // Handle date fields
    if (req.body.startDate) {
      updateData.startDate = new Date(req.body.startDate);
    }
    if (req.body.endDate) {
      updateData.endDate = new Date(req.body.endDate);
    }

    // Recalculate sharesAfter if shares fields are updated
    if (updateData.sharesBefore !== undefined || updateData.newSharesOffered !== undefined) {
      const existing = await prisma.emission.findUnique({
        where: { id },
        select: { sharesBefore: true, newSharesOffered: true }
      });
      
      if (!existing) {
        res.status(404).json({ error: 'Emission not found' });
        return;
      }

      const sharesBefore = updateData.sharesBefore ?? existing.sharesBefore;
      const newSharesOffered = updateData.newSharesOffered ?? existing.newSharesOffered;
      updateData.sharesAfter = sharesBefore + newSharesOffered;
    }

    // Validate dates if both are provided
    if (updateData.startDate && updateData.endDate) {
      if (updateData.endDate <= updateData.startDate) {
        res.status(400).json({ error: 'End date must be after start date' });
        return;
      }
    }

    // Handle file upload - Cloudinary returns the URL in req.file
    if (req.file) {
      console.log('Update - Full file object from Cloudinary:', JSON.stringify(req.file, null, 2));
      const cloudinaryFile = req.file as any;
      
      // multer-storage-cloudinary stores the URL in the 'path' property
      updateData.presentationFileUrl = cloudinaryFile.path || 
                                       cloudinaryFile.secure_url || 
                                       cloudinaryFile.url;
      
      // If no URL found, try to construct from filename
      if (!updateData.presentationFileUrl && cloudinaryFile.filename) {
        updateData.presentationFileUrl = cloudinaryFile.filename;
      }
      
      // Ensure we have the secure URL format
      if (updateData.presentationFileUrl && !updateData.presentationFileUrl.startsWith('https://')) {
        // If it's just a public_id, construct the full URL
        updateData.presentationFileUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${updateData.presentationFileUrl}`;
      }
      
      console.log('Update - Final Presentation File URL:', updateData.presentationFileUrl);
      
      if (!updateData.presentationFileUrl) {
        console.error('Failed to get URL from Cloudinary upload:', req.file);
        res.status(500).json({ error: 'File upload succeeded but URL not found' });
        return;
      }
    }

    const emission = await prisma.emission.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json(emission);
  } catch (error: any) {
    console.error('Error updating emission:', error);
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Emission not found' });
      return;
    }
    res.status(500).json({ error: 'Failed to update emission' });
  }
};

// Delete emission
export const deleteEmission = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const userRole = req.userRole;
    
    // Only admins can delete emissions
    if (userRole !== 'ADMIN') {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const { id } = req.params;

    // First check if emission exists and its status
    const emission = await prisma.emission.findUnique({
      where: { id }
    });

    if (!emission) {
      res.status(404).json({ error: 'Emission not found' });
      return;
    }

    // Only allow deletion of PREVIEW emissions
    if (emission.status !== 'PREVIEW') {
      res.status(400).json({ error: 'Can only delete PREVIEW emissions' });
      return;
    }

    // Delete related records first to avoid foreign key constraint errors
    await prisma.$transaction([
      // Delete audit logs
      prisma.emissionAuditLog.deleteMany({
        where: { emissionId: id }
      }),
      // Delete snapshots
      prisma.shareholderSnapshot.deleteMany({
        where: { emissionId: id }
      }),
      // Delete subscriptions
      prisma.emissionSubscription.deleteMany({
        where: { emissionId: id }
      }),
      // Finally delete the emission
      prisma.emission.delete({
        where: { id }
      })
    ]);

    res.json({ message: 'Emission deleted successfully' });
  } catch (error) {
    console.error('Error deleting emission:', error);
    res.status(500).json({ error: 'Failed to delete emission' });
  }
};

// Activate emission
export const activateEmission = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const userRole = req.userRole;
    
    // Only admins can activate emissions
    if (userRole !== 'ADMIN') {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const { id } = req.params;

    const emission = await prisma.emission.findUnique({
      where: { id }
    });

    if (!emission) {
      res.status(404).json({ error: 'Emission not found' });
      return;
    }

    if (emission.status !== 'PREVIEW') {
      res.status(400).json({ error: 'Can only activate PREVIEW emissions' });
      return;
    }

    const now = new Date();
    if (now < emission.startDate) {
      res.status(400).json({ error: 'Cannot activate emission before start date' });
      return;
    }

    if (now > emission.endDate) {
      res.status(400).json({ error: 'Cannot activate emission after end date' });
      return;
    }

    const updatedEmission = await prisma.emission.update({
      where: { id },
      data: { status: 'ACTIVE' },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json(updatedEmission);
  } catch (error) {
    console.error('Error activating emission:', error);
    res.status(500).json({ error: 'Failed to activate emission' });
  }
};

// Complete emission
export const completeEmission = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const userRole = req.userRole;
    
    // Only admins can complete emissions
    if (userRole !== 'ADMIN') {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const { id } = req.params;

    const emission = await prisma.emission.findUnique({
      where: { id }
    });

    if (!emission) {
      res.status(404).json({ error: 'Emission not found' });
      return;
    }

    if (emission.status !== 'ACTIVE') {
      res.status(400).json({ error: 'Can only complete ACTIVE emissions' });
      return;
    }

    const updatedEmission = await prisma.emission.update({
      where: { id },
      data: { status: 'COMPLETED' },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json(updatedEmission);
  } catch (error) {
    console.error('Error completing emission:', error);
    res.status(500).json({ error: 'Failed to complete emission' });
  }
};

// Set emission to preview mode
export const setPreviewMode = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const userRole = req.userRole;
    const userLevel = req.userLevel || 1;
    
    // Only level 2 admins can set preview mode
    if (userRole !== 'ADMIN' || userLevel < 2) {
      res.status(403).json({ error: 'Admin level 2 access required' });
      return;
    }

    const { id } = req.params;
    const { isPreview } = req.body;

    const emission = await prisma.emission.findUnique({
      where: { id }
    });

    if (!emission) {
      res.status(404).json({ error: 'Emission not found' });
      return;
    }

    if (emission.status !== 'PREVIEW') {
      res.status(400).json({ error: 'Can only set preview mode for PREVIEW emissions' });
      return;
    }

    const updatedEmission = await prisma.emission.update({
      where: { id },
      data: { 
        isPreview
        // Status remains PREVIEW regardless of isPreview flag
      }
    });

    // Log audit
    await createAuditLog({
      emissionId: id,
      userId: req.userId!,
      action: 'PREVIEW_SET',
      changes: { isPreview },
      metadata: { previousStatus: emission.status }
    });

    res.json(updatedEmission);
  } catch (error) {
    console.error('Error setting preview mode:', error);
    res.status(500).json({ error: 'Failed to set preview mode' });
  }
};

// Finalize emission and update shareholders
export const finalizeEmission = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const userRole = req.userRole;
    const userLevel = req.userLevel || 1;
    
    // Only level 2 admins can finalize
    if (userRole !== 'ADMIN' || userLevel < 2) {
      res.status(403).json({ error: 'Admin level 2 access required' });
      return;
    }

    const { id } = req.params;

    const emission = await prisma.emission.findUnique({
      where: { id },
      include: {
        subscriptions: {
          where: { status: 'APPROVED' }
        }
      }
    });

    if (!emission) {
      res.status(404).json({ error: 'Emission not found' });
      return;
    }

    if (emission.status !== 'COMPLETED') {
      res.status(400).json({ error: 'Can only finalize COMPLETED emissions' });
      return;
    }

    // Calculate total shares subscribed
    const totalSharesSubscribed = emission.subscriptions.reduce(
      (sum, sub) => sum + (sub.sharesAllocated || 0), 
      0
    );

    // Note: Shareholder shares are already updated during subscription approval
    // No need to update them again during finalization

    // Create final snapshot
    await createShareholderSnapshot(id, 'AFTER_FINALIZATION');

    // Update emission status
    const finalizedEmission = await prisma.emission.update({
      where: { id },
      data: {
        status: 'FINALIZED',
        finalizedAt: new Date(),
        finalizedById: req.userId,
        totalSharesSubscribed
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        finalizedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Log audit
    await createAuditLog({
      emissionId: id,
      userId: req.userId!,
      action: 'FINALIZED',
      metadata: { 
        totalSharesSubscribed,
        subscribersCount: emission.subscriptions.length
      }
    });

    res.json(finalizedEmission);
  } catch (error) {
    console.error('Error finalizing emission:', error);
    res.status(500).json({ error: 'Failed to finalize emission' });
  }
};

// Get emission snapshots
export const getEmissionSnapshots = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userRole = req.userRole;
    
    // Only admins can view snapshots
    if (userRole !== 'ADMIN') {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const { id } = req.params;

    const snapshots = await prisma.shareholderSnapshot.findMany({
      where: { emissionId: id },
      orderBy: { createdAt: 'desc' }
    });

    res.json(snapshots);
  } catch (error) {
    console.error('Error fetching snapshots:', error);
    res.status(500).json({ error: 'Failed to fetch snapshots' });
  }
};

// Get emission audit logs
export const getEmissionAuditLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userRole = req.userRole;
    
    // Only admins can view audit logs
    if (userRole !== 'ADMIN') {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const { id } = req.params;

    const auditLogs = await prisma.emissionAuditLog.findMany({
      where: { emissionId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(auditLogs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
};