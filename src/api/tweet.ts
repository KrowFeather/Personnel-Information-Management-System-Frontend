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

export const deleteTweet = (tweetId: number | string) => {
  const tweetIdStr = String(tweetId)
  console.log('Calling deleteTweet API with tweetId:', tweetIdStr)
  return api.post<{ tweet: unknown }>('/tweet/delete', null,{params: {tweetId: tweetIdStr}})
}

export const searchTweet = (keyword?: string, teamId?: number) => {
  const params: Record<string, unknown> = {}
  if (keyword) params.keyword = keyword
  if (teamId !== undefined) params.teamId = teamId
  return api.get<{ tweetList: unknown[] }>('/tweet/search', { params })
}


