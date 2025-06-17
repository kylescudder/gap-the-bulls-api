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

export const getCurrentUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Passport puts your deserialized user on req.user
    const current = req.user as { id: number } | undefined;

    if (!current) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Not authenticated',
      };
      res.status(401).json(response);
      return;
    }

    // Fetch full record from Prisma
    const user = await prisma.user.findUnique({
      where: { id: current.id },
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
      error: 'Failed to fetch current user',
    };
    res.status(500).json(response);
  }
};
