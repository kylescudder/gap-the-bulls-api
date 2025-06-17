import { Request, Response } from 'express';
import { prisma } from '../database/connection';
import { CreateTeamRequest, UpdateTeamRequest, ApiResponse } from '../types';

export const getAllTeams = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const teams = await prisma.team.findMany({
      include: {
        users: {
          include: {
            scores: true,
          },
        },
      },
    });

    const response: ApiResponse<typeof teams> = {
      success: true,
      data: teams,
    };

    res.status(200).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch teams',
    };
    res.status(500).json(response);
  }
};

export const getTeamById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const team = await prisma.team.findUnique({
      where: { id: parseInt(id) },
      include: {
        users: {
          include: {
            scores: true,
          },
        },
      },
    });

    if (!team) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Team not found',
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse<typeof team> = {
      success: true,
      data: team,
    };

    res.status(200).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch team',
    };
    res.status(500).json(response);
  }
};

export const createTeam = async (
  req: Request<{}, {}, CreateTeamRequest>,
  res: Response
): Promise<void> => {
  try {
    const { name } = req.body;

    const team = await prisma.team.create({
      data: { name },
      include: {
        users: true,
      },
    });

    const response: ApiResponse<typeof team> = {
      success: true,
      data: team,
      message: 'Team created successfully',
    };

    res.status(201).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to create team',
    };
    res.status(500).json(response);
  }
};

export const updateTeam = async (
  req: Request<{ id: string }, {}, UpdateTeamRequest>,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const team = await prisma.team.update({
      where: { id: parseInt(id) },
      data: { name },
      include: {
        users: true,
      },
    });

    const response: ApiResponse<typeof team> = {
      success: true,
      data: team,
      message: 'Team updated successfully',
    };

    res.status(200).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to update team',
    };
    res.status(500).json(response);
  }
};

export const deleteTeam = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.team.delete({
      where: { id: parseInt(id) },
    });

    const response: ApiResponse<null> = {
      success: true,
      message: 'Team deleted successfully',
    };

    res.status(200).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to delete team',
    };
    res.status(500).json(response);
  }
};

export const assignUserToTeam = async (
  req: Request<{ teamId: string; userId: string }>,
  res: Response
): Promise<void> => {
  const teamId = parseInt(req.params.teamId, 10);
  const userId = parseInt(req.params.userId, 10);

  try {
    // Verify team exists
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Team not found',
      };
      res.status(404).json(response);
      return;
    }

    // Verify user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'User not found',
      };
      res.status(404).json(response);
      return;
    }

    // Update the user’s teamId
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { teamId },
      include: {
        team: true,
        scores: true,
      },
    });

    const response: ApiResponse<typeof updatedUser> = {
      success: true,
      data: updatedUser,
      message: `User ${userId} assigned to team ${teamId} successfully`,
    };
    res.status(200).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to assign user to team',
    };
    res.status(500).json(response);
  }
};
