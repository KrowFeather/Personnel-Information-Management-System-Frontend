import { api } from '@/net'

export interface TeamCreatePayload {
  name: string
  banner?: string
  logo?: string
  description?: string
}

export interface TeamUpdatePayload {
  id: number
  name?: string
  banner?: string
  logo?: string
  description?: string
}

export const applyCreateTeam = (payload: TeamCreatePayload) => {
  return api.post<{ team: unknown }>('/team/apply-create', payload)
}

export const approveCreateTeam = (teamId: number) => {
  return api.post<{ team: unknown }>('/team/approve-create', null, {
    params: { teamId },
  })
}

export const rejectCreateTeam = (teamId: number) => {
  return api.post<{ team: unknown }>('/team/reject-create', null, {
    params: { teamId },
  })
}

export const deleteTeam = (teamId: number) => {
  return api.post<{ team: unknown }>('/team/delete', null, {
    params: { teamId },
  })
}

export const applyJoinTeam = (teamId: number) => {
  return api.post<{ teamJoinApply: unknown }>('/team/apply-join', null, {
    params: { teamId },
  })
}

export const approveJoinTeam = (teamJoinApplyId: number) => {
  return api.post<{ teamJoinApply: unknown }>('/team/approve-join-apply', null, {
    params: { teamJoinApplyId },
  })
}

export const rejectJoinTeam = (teamJoinApplyId: number) => {
  return api.post<{ teamJoinApply: unknown }>('/team/reject-join-apply', null, {
    params: { teamJoinApplyId },
  })
}

export const removeTeamMember = (teamId: number, memberId: number) => {
  return api.post<{ teamMember: unknown }>('/team/remove-member', null, {
    params: { teamId, memberId },
  })
}

export const leaveTeam = (teamId: number) => {
  return api.post<{ teamMember: unknown }>('/team/leave', null, {
    params: { teamId },
  })
}

export const updateTeamInfo = (payload: TeamUpdatePayload) => {
  return api.put<{ team: unknown }>('/team/update-info', payload)
}

export const updateTeamMemberPosition = (teamId: number, memberId: number, position: string) => {
  return api.put<{ teamMember: unknown }>('/team/update-member-position', null, {
    params: { teamId, memberId, position },
  })
}

export const getTeamList = (status?: number) => {
  return api.post<{ teamList: unknown[] }>('/team/get-list', null, {
    params: status !== undefined ? { status } : {},
  })
}

export const getTeamInfo = (teamId: number) => {
  return api.post<{ team: unknown }>('/team/get-info', null, {
    params: { teamId },
  })
}

export const getTeamMembers = (teamId: number) => {
  return api.post<{ teamMemberList: unknown[] }>('/team/get-members', null, {
    params: { teamId },
  })
}

export const getTeamJoinApplications = (teamId: number) => {
  return api.post<{ teamJoinApplyList: unknown[] }>('/team/get-join-applications', null, {
    params: { teamId },
  })
}

export const getMyTeams = () => {
  return api.post<{ teamList: unknown[] }>('/team/get-my-teams')
}

export const getTeamGraph = (teamId: number) => {
  return api.post<{ nodes: unknown[]; links: unknown[] }>('/team/graph', null, {
    params: { teamId },
  })
}


