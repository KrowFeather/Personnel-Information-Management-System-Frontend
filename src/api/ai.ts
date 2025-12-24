/**
 * AI 助手 API
 * 调用 Python LLM QA 后端服务
 */

// Python LLM 服务的 base URL，可以根据实际情况修改
const AI_BASE_URL = 'http://localhost:8000'

export interface QueryRequest {
  query: string
}

export interface StreamChunk {
  content: string
  done: boolean
  error?: boolean
}

/**
 * 流式查询接口
 * @param query 用户问题
 * @param onChunk 接收数据块的回调函数
 * @param onError 错误回调函数
 * @param onComplete 完成回调函数
 */
export const queryStream = async (
  query: string,
  onChunk: (chunk: StreamChunk) => void,
  onError?: (error: Error) => void,
  onComplete?: () => void
): Promise<void> => {
  try {
    const response = await fetch(`${AI_BASE_URL}/query/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('Response body is not readable')
    }

    const decoder = new TextDecoder('utf-8')
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      
      if (done) {
        onComplete?.()
        break
      }

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // 保留最后一个不完整的行

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const dataStr = line.slice(6) // 移除 'data: ' 前缀
            const data: StreamChunk = JSON.parse(dataStr)
            onChunk(data)

            if (data.done) {
              onComplete?.()
              return
            }
          } catch (e) {
            console.error('Failed to parse SSE data:', e, line)
          }
        }
      }
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    onError?.(err)
    throw err
  }
}

