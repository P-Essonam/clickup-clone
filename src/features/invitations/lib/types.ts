export type InvitationState = "accepted" | "revoked" | "expired" | "pending"


export type InvitationItems = {
    id: string
    email: string
    state: InvitationState
    createdAt: string,
    expiresAt: string | null
}