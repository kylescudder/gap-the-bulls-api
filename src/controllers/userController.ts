import { Request, Response } from 'express';
import { prisma } from '../database/connection';
import { CreateUserRequest, UpdateUserRequest, ApiResponse } from '../types';

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      include: {
        team: true,
        scores: true,
      },
    });

    const response: ApiResponse<typeof users> = {
      success: true,
      data: users,
    };

    res.status(200).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch users',
    };
    res.status(500).json(response);
  }
};

export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        team: true,
        scores: true,
      },
    });

    if (!user) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'User not found',
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse<typeof user> = {
      success: true,
      data: user,
    };

    res.status(200).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch user',
    };
    res.status(500).json(response);
  }
};

export const getUsersByTeam = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { teamId } = req.params;
    const users = await prisma.user.findMany({
      where: { teamId: parseInt(teamId) },
      include: {
        team: true,
        scores: true,
      },
    });

    const response: ApiResponse<typeof users> = {
      success: true,
      data: users,
    };

    res.status(200).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch users by team',
    };
    res.status(500).json(response);
  }
};

export const createUser = async (
  req: Request<{}, {}, CreateUserRequest>,
  res: Response
): Promise<void> => {
  try {
    const { name, teamId } = req.body;

    // Verify team exists
    const teamExists = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!teamExists) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Team not found',
      };
      res.status(400).json(response);
      return;
    }

    const user = await prisma.user.create({
      data: { name, teamId },
      include: {
        team: true,
        scores: true,
      },
    });

    const response: ApiResponse<typeof user> = {
      success: true,
      data: user,
      message: 'User created successfully',
    };

    res.status(201).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to create user',
    };
    res.status(500).json(response);
  }
};

export const updateUser = async (
  req: Request<{ id: string }, {}, UpdateUserRequest>,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, teamId } = req.body;

    // If teamId is provided, verify team exists
    if (teamId) {
      const teamExists = await prisma.team.findUnique({
        where: { id: teamId },
      });

      if (!teamExists) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Team not found',
        };
        res.status(400).json(response);
        return;
      }
    }

    const updateData: { name?: string; teamId?: number } = {};
    if (name !== undefined) updateData.name = name;
    if (teamId !== undefined) updateData.teamId = teamId;

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        team: true,
        scores: true,
      },
    });

    const response: ApiResponse<typeof user> = {
      success: true,
      data: user,
      message: 'User updated successfully',
    };

    res.status(200).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to update user',
    };
    res.status(500).json(response);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if user has scores and handle accordingly
    const userWithScores = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: { scores: true },
    });

    if (!userWithScores) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'User not found',
      };
      res.status(404).json(response);
      return;
    }

    // Delete user and associated scores in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete all scores for this user first
      await tx.score.deleteMany({
        where: { userId: parseInt(id) },
      });

      // Then delete the user
      await tx.user.delete({
        where: { id: parseInt(id) },
      });
    });

    const response: ApiResponse<null> = {
      success: true,
      message: 'User and associated scores deleted successfully',
    };

    res.status(200).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to delete user',
    };
    res.status(500).json(response);
  }
};

export const getUserScores = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        team: true,
        scores: {
          orderBy: {
            id: 'desc',
          },
        },
      },
    });

    if (!user) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'User not found',
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse<typeof user.scores> = {
      success: true,
      data: user.scores,
    };

    res.status(200).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch user scores',
    };
    res.status(500).json(response);
  }
};
