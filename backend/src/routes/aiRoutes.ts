import { Router } from 'express';
import aiController from '../controllers/aiController';

const router: Router = Router();

/**
 * @route POST /api/ai/review
 * @desc Perform AI-powered code review on a diff
 * @access Private (requires authentication)
 */
router.post('/review', (req, res) => aiController.reviewCode(req, res));

/**
 * @route POST /api/ai/review-pr
 * @desc Perform global AI-powered code review on entire PR
 * @access Private (requires authentication)
 */
router.post('/review-pr', (req, res) => aiController.reviewPullRequest(req, res));

/**
 * @route GET /api/ai/health
 * @desc Check AI service health
 * @access Public
 */
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'AI service is healthy',
        timestamp: new Date().toISOString(),
        azureOpenAI: {
            configured: !!(process.env.OPEN_AI_KEY_AZURE_OMNI && process.env.OPEN_AI_AZURE_BASE_URL_OMNI),
            engine: process.env.OPEN_AI_AZURE_ENGINE_OMNI || 'gpt-4o',
            deployment: process.env.OPEN_AI_DEPLOYMENT_NAME_OMNI || 'Not configured'
        }
    });
});

export default router;
