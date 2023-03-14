import { Router } from "express";
import {
  getAllUsers,
  getOneUser,
  createOneUser,
  updateOneUser,
  deleteOneUser,
} from "../controllers/usersController";

const router = Router();

router.get("/", getAllUsers);
router.get("/:id", getOneUser);
router.post("/", createOneUser);
router.patch("/:id", updateOneUser);
router.delete("/:id", deleteOneUser);

export default router;
