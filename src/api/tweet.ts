import { api } from '@/net'

export interface TweetSendPayload {
  teamId: number
  title: string
  content: string
  images: string[]
}

export const sendTweet = (payload: TweetSendPayload) => {
  return api.post<{ tweet: unknown }>('/tweet/send', payload)
}

export const deleteTweet = (tweetId: number) => {
  return api.post<{ tweet: unknown }>('/tweet/delete', null, {
    params: { tweetId },
  })
}

export const searchTweet = (keyword?: string, teamId?: number) => {
  const params: Record<string, unknown> = {}
  if (keyword) params.keyword = keyword
  if (teamId !== undefined) params.teamId = teamId
  return api.get<{ tweetList: unknown[] }>('/tweet/search', { params })
}


