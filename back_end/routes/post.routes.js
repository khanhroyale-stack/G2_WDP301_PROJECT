import express from "express";
import {
	createPost,
	getPosts,
	getPostCategories,
	getMyPosts,
	getPostsForModeration,
	getPostById,
	updatePost,
	deletePost,
	approvePost,
	rejectPost,
	markPostAsSold,
	getMySoldPosts,
} from "../controllers/post.controller.js";
import { authMiddleware, isAdmin } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { validateBody, validateParams, validateQuery } from "../middleware/validate.js";
import {
	createPostSchema,
	updatePostSchema,
	rejectPostSchema,
	postIdParamsSchema,
	myPostsQuerySchema,
	moderationQuerySchema,
	postsPublicQuerySchema,
} from "../validators/post.validator.js";

const router = express.Router();
router.post("/", authMiddleware, upload.array("images", 5), validateBody(createPostSchema), createPost);
router.get("/", validateQuery(postsPublicQuerySchema), getPosts);
router.get("/categories", getPostCategories);
router.get("/me", authMiddleware, validateQuery(myPostsQuerySchema), getMyPosts);
router.get("/me/sold", authMiddleware, getMySoldPosts);
router.get("/moderation", authMiddleware, isAdmin, validateQuery(moderationQuerySchema), getPostsForModeration);
router.get("/:id", validateParams(postIdParamsSchema), getPostById);
router.put("/:id", authMiddleware, validateParams(postIdParamsSchema), upload.array("images", 5), validateBody(updatePostSchema), updatePost);
router.delete("/:id", authMiddleware, validateParams(postIdParamsSchema), deletePost);
router.patch("/:id/sold", authMiddleware, validateParams(postIdParamsSchema), markPostAsSold);
router.patch("/:id/approve", authMiddleware, isAdmin, validateParams(postIdParamsSchema), approvePost);
router.patch("/:id/reject", authMiddleware, isAdmin, validateParams(postIdParamsSchema), validateBody(rejectPostSchema), rejectPost);
export default router;