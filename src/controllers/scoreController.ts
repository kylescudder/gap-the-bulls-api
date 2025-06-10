import { Request, Response } from 'express';
import { prisma } from '../database/connection';
import { CreateScoreRequest, UpdateScoreRequest, ApiResponse } from '../types';

export const getAllScores = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const scores = await prisma.score.findMany({
      include: {
        user: {
          include: {
            team: true,
          },
        },
      },
    });

    const response: ApiResponse<typeof scores> = {
      success: true,
      data: scores,
    };

    res.status(200).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch scores',
    };
    res.status(500).json(response);
  }
};

export const getScoreById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const score = await prisma.score.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          include: {
            team: true,
          },
        },
      },
    });

    if (!score) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Score not found',
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse<typeof score> = {
      success: true,
      data: score,
    };

    res.status(200).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch score',
    };
    res.status(500).json(response);
  }
};

export const createScore = async (
  req: Request<{}, {}, CreateScoreRequest>,
  res: Response
): Promise<void> => {
  try {
    const { userId, score } = req.body;

    const newScore = await prisma.score.create({
      data: { userId, score },
      include: {
        user: {
          include: {
            team: true,
          },
        },
      },
    });

    const response: ApiResponse<typeof newScore> = {
      success: true,
      data: newScore,
      message: 'Score created successfully',
    };

    res.status(201).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to create score',
    };
    res.status(500).json(response);
  }
};

export const updateScore = async (
  req: Request<{ id: string }, {}, UpdateScoreRequest>,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { score } = req.body;

    const updatedScore = await prisma.score.update({
      where: { id: parseInt(id) },
      data: { score },
      include: {
        user: {
          include: {
            team: true,
          },
        },
      },
    });

    const response: ApiResponse<typeof updatedScore> = {
      success: true,
      data: updatedScore,
      message: 'Score updated successfully',
    };

    res.status(200).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to update score',
    };
    res.status(500).json(response);
  }
};

export const deleteScore = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.score.delete({
      where: { id: parseInt(id) },
    });

    const response: ApiResponse<null> = {
      success: true,
      message: 'Score deleted successfully',
    };

    res.status(200).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to delete score',
    };
    res.status(500).json(response);
  }
};
