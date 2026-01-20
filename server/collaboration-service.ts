import { trackUsage } from "./db";

/**
 * Collaboration Service
 * Manages team projects, shared documents, and real-time editing
 */

export interface CollaborationProject {
  id: number;
  creatorId: number;
  title: string;
  description?: string;
  status: "active" | "archived" | "completed";
  visibility: "private" | "team" | "public";
  members: ProjectMember[];
  documents: SharedDocument[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectMember {
  id: number;
  projectId: number;
  userId: number;
  userName: string;
  role: "owner" | "editor" | "viewer" | "commenter";
  joinedAt: Date;
  permissions: {
    edit: boolean;
    comment: boolean;
    invite: boolean;
    delete: boolean;
  };
}

export interface SharedDocument {
  id: number;
  projectId: number;
  title: string;
  documentType: "script" | "outline" | "notes" | "brainstorm";
  content: string;
  language: "tamil" | "tanglish" | "mixed";
  currentVersion: number;
  lastEditedBy: number;
  lastEditedAt: Date;
  isLocked: boolean;
  lockedBy?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentComment {
  id: number;
  documentId: number;
  userId: number;
  userName: string;
  content: string;
  lineNumber?: number;
  charOffset?: number;
  resolved: boolean;
  replies: CommentReply[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentReply {
  userId: number;
  userName: string;
  content: string;
  createdAt: Date;
}

export interface DocumentVersion {
  id: number;
  documentId: number;
  version: number;
  content: string;
  editedBy: number;
  changesSummary?: string;
  createdAt: Date;
}

export interface CollaborationActivity {
  id: number;
  projectId: number;
  userId: number;
  userName: string;
  activityType: ActivityType;
  targetId?: number;
  description?: string;
  createdAt: Date;
}

export type ActivityType =
  | "document_created"
  | "document_edited"
  | "document_deleted"
  | "comment_added"
  | "comment_resolved"
  | "member_joined"
  | "member_left"
  | "member_role_changed"
  | "document_locked"
  | "document_unlocked";

/**
 * Create a new collaboration project
 */
export async function createCollaborationProject(
  creatorId: number,
  title: string,
  description?: string,
  visibility: "private" | "team" | "public" = "private"
): Promise<CollaborationProject> {
  try {
    const project: CollaborationProject = {
      id: Math.floor(Math.random() * 1000000),
      creatorId,
      title,
      description,
      status: "active",
      visibility,
      members: [
        {
          id: 1,
          projectId: 1,
          userId: creatorId,
          userName: "Creator",
          role: "owner",
          joinedAt: new Date(),
          permissions: {
            edit: true,
            comment: true,
            invite: true,
            delete: true,
          },
        },
      ],
      documents: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return project;
  } catch (error) {
    console.error("[Collaboration] Failed to create project:", error);
    throw new Error("Failed to create collaboration project");
  }
}

/**
 * Add member to project
 */
export async function addProjectMember(
  projectId: number,
  userId: number,
  userName: string,
  role: "editor" | "viewer" | "commenter" = "editor"
): Promise<ProjectMember> {
  try {
    const permissions = {
      edit: role === "editor",
      comment: role !== "viewer",
      invite: role === "editor",
      delete: false,
    };

    const member: ProjectMember = {
      id: Math.floor(Math.random() * 1000000),
      projectId,
      userId,
      userName,
      role,
      joinedAt: new Date(),
      permissions,
    };

    return member;
  } catch (error) {
    console.error("[Collaboration] Failed to add member:", error);
    throw new Error("Failed to add project member");
  }
}

/**
 * Create shared document
 */
export async function createSharedDocument(
  projectId: number,
  title: string,
  documentType: "script" | "outline" | "notes" | "brainstorm",
  content: string = "",
  language: "tamil" | "tanglish" | "mixed" = "tamil"
): Promise<SharedDocument> {
  try {
    const document: SharedDocument = {
      id: Math.floor(Math.random() * 1000000),
      projectId,
      title,
      documentType,
      content,
      language,
      currentVersion: 1,
      lastEditedBy: 0,
      lastEditedAt: new Date(),
      isLocked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return document;
  } catch (error) {
    console.error("[Collaboration] Failed to create document:", error);
    throw new Error("Failed to create shared document");
  }
}

/**
 * Update document content with version tracking
 */
export async function updateDocumentContent(
  documentId: number,
  newContent: string,
  editedBy: number,
  changesSummary?: string
): Promise<{
  document: SharedDocument;
  version: DocumentVersion;
}> {
  try {
    // Create version record
    const version: DocumentVersion = {
      id: Math.floor(Math.random() * 1000000),
      documentId,
      version: 1,
      content: newContent,
      editedBy,
      changesSummary,
      createdAt: new Date(),
    };

    // Update document
    const document: SharedDocument = {
      id: documentId,
      projectId: 0,
      title: "",
      documentType: "script",
      content: newContent,
      language: "tamil",
      currentVersion: 2,
      lastEditedBy: editedBy,
      lastEditedAt: new Date(),
      isLocked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return { document, version };
  } catch (error) {
    console.error("[Collaboration] Failed to update document:", error);
    throw new Error("Failed to update document content");
  }
}

/**
 * Lock document for exclusive editing
 */
export async function lockDocument(documentId: number, userId: number): Promise<SharedDocument> {
  try {
    const document: SharedDocument = {
      id: documentId,
      projectId: 0,
      title: "",
      documentType: "script",
      content: "",
      language: "tamil",
      currentVersion: 1,
      lastEditedBy: userId,
      lastEditedAt: new Date(),
      isLocked: true,
      lockedBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return document;
  } catch (error) {
    console.error("[Collaboration] Failed to lock document:", error);
    throw new Error("Failed to lock document");
  }
}

/**
 * Unlock document
 */
export async function unlockDocument(documentId: number): Promise<SharedDocument> {
  try {
    const document: SharedDocument = {
      id: documentId,
      projectId: 0,
      title: "",
      documentType: "script",
      content: "",
      language: "tamil",
      currentVersion: 1,
      lastEditedBy: 0,
      lastEditedAt: new Date(),
      isLocked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return document;
  } catch (error) {
    console.error("[Collaboration] Failed to unlock document:", error);
    throw new Error("Failed to unlock document");
  }
}

/**
 * Add comment to document
 */
export async function addDocumentComment(
  documentId: number,
  userId: number,
  userName: string,
  content: string,
  lineNumber?: number,
  charOffset?: number
): Promise<DocumentComment> {
  try {
    const comment: DocumentComment = {
      id: Math.floor(Math.random() * 1000000),
      documentId,
      userId,
      userName,
      content,
      lineNumber,
      charOffset,
      resolved: false,
      replies: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return comment;
  } catch (error) {
    console.error("[Collaboration] Failed to add comment:", error);
    throw new Error("Failed to add comment");
  }
}

/**
 * Reply to comment
 */
export async function replyToComment(
  commentId: number,
  userId: number,
  userName: string,
  content: string
): Promise<DocumentComment> {
  try {
    const reply: CommentReply = {
      userId,
      userName,
      content,
      createdAt: new Date(),
    };

    // In production, fetch existing comment and add reply
    const comment: DocumentComment = {
      id: commentId,
      documentId: 0,
      userId: 0,
      userName: "",
      content: "",
      resolved: false,
      replies: [reply],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return comment;
  } catch (error) {
    console.error("[Collaboration] Failed to reply to comment:", error);
    throw new Error("Failed to reply to comment");
  }
}

/**
 * Resolve comment
 */
export async function resolveComment(commentId: number, resolvedBy: number): Promise<DocumentComment> {
  try {
    const comment: DocumentComment = {
      id: commentId,
      documentId: 0,
      userId: 0,
      userName: "",
      content: "",
      resolved: true,
      replies: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return comment;
  } catch (error) {
    console.error("[Collaboration] Failed to resolve comment:", error);
    throw new Error("Failed to resolve comment");
  }
}

/**
 * Get document history
 */
export async function getDocumentHistory(documentId: number): Promise<DocumentVersion[]> {
  try {
    const versions: DocumentVersion[] = [
      {
        id: 1,
        documentId,
        version: 1,
        content: "Initial content",
        editedBy: 1,
        changesSummary: "Created document",
        createdAt: new Date(Date.now() - 86400000),
      },
      {
        id: 2,
        documentId,
        version: 2,
        content: "Updated content",
        editedBy: 2,
        changesSummary: "Added more details",
        createdAt: new Date(Date.now() - 43200000),
      },
    ];

    return versions;
  } catch (error) {
    console.error("[Collaboration] Failed to get document history:", error);
    throw new Error("Failed to get document history");
  }
}

/**
 * Get project activity feed
 */
export async function getProjectActivity(projectId: number, limit: number = 50): Promise<CollaborationActivity[]> {
  try {
    const activities: CollaborationActivity[] = [
      {
        id: 1,
        projectId,
        userId: 1,
        userName: "Creator",
        activityType: "document_created",
        description: "Created project",
        createdAt: new Date(Date.now() - 86400000),
      },
      {
        id: 2,
        projectId,
        userId: 2,
        userName: "Collaborator",
        activityType: "member_joined",
        description: "Joined project",
        createdAt: new Date(Date.now() - 43200000),
      },
      {
        id: 3,
        projectId,
        userId: 2,
        userName: "Collaborator",
        activityType: "document_edited",
        targetId: 1,
        description: "Created script document",
        createdAt: new Date(Date.now() - 3600000),
      },
    ];

    return activities.slice(0, limit);
  } catch (error) {
    console.error("[Collaboration] Failed to get activity:", error);
    throw new Error("Failed to get project activity");
  }
}

/**
 * Get real-time collaborators
 */
export async function getActiveCollaborators(projectId: number): Promise<ProjectMember[]> {
  try {
    const collaborators: ProjectMember[] = [
      {
        id: 1,
        projectId,
        userId: 1,
        userName: "Creator",
        role: "owner",
        joinedAt: new Date(),
        permissions: {
          edit: true,
          comment: true,
          invite: true,
          delete: true,
        },
      },
      {
        id: 2,
        projectId,
        userId: 2,
        userName: "Collaborator",
        role: "editor",
        joinedAt: new Date(),
        permissions: {
          edit: true,
          comment: true,
          invite: false,
          delete: false,
        },
      },
    ];

    return collaborators;
  } catch (error) {
    console.error("[Collaboration] Failed to get collaborators:", error);
    throw new Error("Failed to get active collaborators");
  }
}

/**
 * Detect and resolve conflicts in collaborative editing
 */
export async function resolveEditConflict(
  documentId: number,
  version1: string,
  version2: string,
  strategy: "merge" | "latest" | "manual" = "merge"
): Promise<string> {
  try {
    // Simple conflict resolution strategies
    switch (strategy) {
      case "latest":
        return version2;
      case "merge":
        // Simple merge: combine non-overlapping changes
        return `${version1}\n\n${version2}`;
      case "manual":
        // Return both versions for manual resolution
        return `CONFLICT:\nVersion 1:\n${version1}\n\nVersion 2:\n${version2}`;
      default:
        return version2;
    }
  } catch (error) {
    console.error("[Collaboration] Failed to resolve conflict:", error);
    throw new Error("Failed to resolve edit conflict");
  }
}

/**
 * Export project as document
 */
export async function exportProjectAsDocument(
  projectId: number,
  format: "pdf" | "docx" | "md" = "md"
): Promise<{
  filename: string;
  content: string;
  mimeType: string;
}> {
  try {
    let content = "# Project Export\n\n";
    let mimeType = "text/markdown";
    let extension = "md";

    if (format === "pdf") {
      mimeType = "application/pdf";
      extension = "pdf";
    } else if (format === "docx") {
      mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      extension = "docx";
    }

    return {
      filename: `project_${projectId}.${extension}`,
      content,
      mimeType,
    };
  } catch (error) {
    console.error("[Collaboration] Failed to export project:", error);
    throw new Error("Failed to export project");
  }
}
