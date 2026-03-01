import { Project, Tool, Skill, MCPServer } from "../types/index.types";
import {
  PluginStore,
  resolveTools,
  resolveSkills,
  resolveMCPServers,
} from "../types/store.types";
import { Logger } from "../services/Logger";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export class ProjectManager {
  constructor(
    private store: PluginStore,
    private logger: Logger,
  ) {}

  createProject(input: {
    name: string;
    description?: string;
    vaultPath?: string;
  }): Project {
    const project: Project = {
      id: generateId(),
      name: input.name,
      description: input.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      vaultPath: input.vaultPath,
      toolIds: [],
      mcpIds: [],
      skillIds: [],
      hooks: [],
    };

    this.store.projects.push(project);
    this.logger.info("Project created", {
      projectId: project.id,
      name: project.name,
    });

    return project;
  }

  getProject(projectId: string): Project | null {
    return this.store.projects.find((p) => p.id === projectId) ?? null;
  }

  updateProject(projectId: string, updates: Partial<Project>): Project | null {
    const project = this.getProject(projectId);
    if (!project) return null;

    Object.assign(project, updates, {
      updatedAt: new Date().toISOString(),
    });

    this.logger.info("Project updated", { projectId });
    return project;
  }

  deleteProject(projectId: string): boolean {
    const index = this.store.projects.findIndex((p) => p.id === projectId);
    if (index === -1) return false;

    this.store.projects.splice(index, 1);

    this.store.sessions = this.store.sessions.filter(
      (s) => s.projectId !== projectId,
    );

    this.logger.info("Project deleted", { projectId });
    return true;
  }

  addToolToProject(projectId: string, toolId: string): boolean {
    const project = this.getProject(projectId);
    const tool = this.store.tools.find((t) => t.id === toolId);

    if (!project || !tool) return false;

    if (!project.toolIds.includes(toolId)) {
      project.toolIds.push(toolId);
      project.updatedAt = new Date().toISOString();
      this.logger.info("Tool added to project", { projectId, toolId });
    }

    return true;
  }

  removeToolFromProject(projectId: string, toolId: string): boolean {
    const project = this.getProject(projectId);
    if (!project) return false;

    const index = project.toolIds.indexOf(toolId);
    if (index === -1) return false;

    project.toolIds.splice(index, 1);
    project.updatedAt = new Date().toISOString();

    this.logger.info("Tool removed from project", { projectId, toolId });
    return true;
  }

  getProjectTools(projectId: string): Tool[] {
    const project = this.getProject(projectId);
    if (!project) return [];

    return resolveTools(this.store, project);
  }

  getProjectMCPServers(projectId: string): MCPServer[] {
    const project = this.getProject(projectId);
    if (!project) return [];

    return resolveMCPServers(this.store, project);
  }

  getProjectSkills(projectId: string): Skill[] {
    const project = this.getProject(projectId);
    if (!project) return [];

    return resolveSkills(this.store, project);
  }

  listProjects(): Project[] {
    return [...this.store.projects];
  }
}
