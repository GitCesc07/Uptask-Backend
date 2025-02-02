import type { Request, Response } from "express";
import User from "../models/User";
import Project from "../models/Project";

export class TeamController {
  static findMemberByEmail = async (req: Request, res: Response) => {
    const { email } = req.body;

    // * Find User
    const user = await User.findOne({ email }).select("id name email");

    if (!user) {
      const error = new Error("Usuario no encontrado");
      return res.status(404).json({ message: error.message });
    }

    res.json(user);
  };

  static getProjectTeam = async (req: Request, res: Response) => {
    const project = await Project.findById(req.project.id).populate({
      path: "team",
      select: "id name email"
    })
    res.json(project.team)

  }

  static addMemberById = async (req: Request, res: Response) => {
    const { id } = req.body;

    // * Find User
    const user = await User.findById(id).select("id");

    if (!user) {
      const error = new Error("Usuario no encontrado");
      return res.status(404).json({ message: error.message });
    }

    if (
      req.project.team.some((team) => team.toString() === user.id.toString())
    ) {
      const error = new Error(
        "El usuario que deseas agregar, ya es colaborador de este proyecto"
      );
      return res.status(409).json({ message: error.message });
    }

    req.project.team.push(user.id);
    await req.project.save();

    res.send("Colaborador agregado correctamente");
  };

  static removeMemberById = async (req: Request, res: Response) => {
    const { id } = req.body;

    if (!req.project.team.some((team) => team.toString() === id.toString())) {
      const error = new Error(
        "El usuario que deseas eliminar, no existe en el proyecto"
      );
      return res.status(409).json({ message: error.message });
    }

    req.project.team = req.project.team.filter(
      (teamMember) => teamMember.toString() !== id.toString()
    );
    await req.project.save();

    res.send("Colaborador eliminado correctamente");
  };
}
