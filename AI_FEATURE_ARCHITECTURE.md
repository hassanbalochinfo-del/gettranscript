# AI Polish + Translate Feature Architecture Plan

## Overview
This document outlines the architecture for future AI-powered features: "Polish with AI" and "Translate" transcript enhancements.

## Feature Requirements

### 1. AI Polish
- **Purpose**: Improve transcript readability, fix grammar, add punctuation, format better
- **Credit Cost**: 1 credit per polish operation
- **Input**: Raw transcript text (with or without timestamps)
- **Output**: Polished transcript (maintains timestamp alignment if provided)

### 2. AI Translate
- **Purpose**: Translate transcript to target language
- **Credit Cost**: 1 credit per translation operation
- **Input**: Transcript text, target language code (e.g., "es", "fr", "de")
- **Output**: Translated transcript (maintains timestamp alignment if provided)

## API Endpoints

### POST /api/ai/polish
```typescript
Request Body:
{
  transcript: string
  segments?: Array<{ text: string; start?: number; duration?: number }>
  preserveTimestamps?: boolean
}

Response:
{
  polished: string
  segments?: Array<{ text: string; start?: number; duration?: number }>
}
```

### POST /api/ai/translate
```typescript
Request Body:
{
  transcript: string
  targetLanguage: string // ISO 639-1 code (e.g., "es", "fr", "de")
  segments?: Array<{ text: string; start?: number; duration?: number }>
  preserveTimestamps?: boolean
}

Response:
{
  translated: string
  segments?: Array<{ text: string; start?: number; duration?: number }>
  targetLanguage: string
}
```

## Implementation Details

### Credit Gating
Both endpoints will:
1. Check user authentication
2. Check active subscription status
3. Check credits balance (must be > 0)
4. Decrement 1 credit on success
5. Create CreditLedger entry with type "ai_polish" or "ai_translate"

### OpenAI Integration
- **Model**: `gpt-4o-mini` (cost-effective, fast)
- **API Key**: `OPENAI_API_KEY` environment variable
- **Rate Limiting**: Per-user rate limiting (e.g., 10 requests/minute)

### Prompt Engineering

#### Polish Prompt
```
You are a professional transcript editor. Improve the following transcript for readability:
- Fix grammar and spelling errors
- Add proper punctuation
- Improve sentence structure
- Maintain the original meaning
- If timestamps are provided, preserve them exactly

Transcript:
{transcript}
```

#### Translate Prompt
```
You are a professional translator. Translate the following transcript to {targetLanguage}:
- Maintain accuracy and natural flow
- Preserve technical terms when appropriate
- If timestamps are provided, preserve them exactly

Transcript:
{transcript}
```

### Timestamp Preservation
- If `segments` array is provided, process each segment individually
- Maintain `start` and `duration` values
- Only modify `text` field
- Return segments in same order

## Database Schema Updates

### CreditLedger Types
Already supported:
- `"ai_polish"` - AI polish operation
- `"ai_translate"` - AI translation operation

### Metadata Storage
Store in CreditLedger.metadata:
```json
{
  "operation": "polish" | "translate",
  "targetLanguage": "es" | "fr" | ... (for translate),
  "originalLength": number,
  "processedLength": number,
  "videoId": string (optional)
}
```

## Security & Rate Limiting

### Rate Limiting Strategy
1. **Per-user rate limit**: 10 AI operations per minute
2. **Per-IP rate limit**: 20 requests per minute (fallback)
3. **OpenAI rate limit**: Handle 429 responses gracefully with retry

### Input Validation
- Maximum transcript length: 50,000 characters
- Validate language codes against allowed list
- Sanitize input to prevent prompt injection

### Error Handling
- OpenAI API failures: Return 503 with retry suggestion
- Credit deduction: Only on successful AI operation
- Partial failures: Rollback credit deduction

## Queue System (Optional Future Enhancement)

### Why Queue?
- For long transcripts (>10,000 chars), processing may take >30 seconds
- Better UX with async processing
- Handle rate limits gracefully

### Implementation Options
1. **Simple**: Polling endpoint (`GET /api/ai/status/:jobId`)
2. **Advanced**: WebSocket or Server-Sent Events for real-time updates
3. **Queue Service**: BullMQ, Inngest, or Vercel Queue

### Job Schema
```typescript
{
  id: string
  userId: string
  type: "polish" | "translate"
  status: "pending" | "processing" | "completed" | "failed"
  input: { transcript: string; ... }
  output?: { result: string; ... }
  error?: string
  createdAt: Date
  completedAt?: Date
}
```

## Frontend Integration

### UI Components
1. **Polish Button**: "Polish with AI" button next to transcript
2. **Translate Dropdown**: Language selector + "Translate" button
3. **Loading State**: Show spinner during processing
4. **Result Display**: Replace or show side-by-side comparison

### User Flow
1. User views transcript
2. Clicks "Polish with AI" or selects language + "Translate"
3. Modal confirms credit cost (1 credit)
4. Processing indicator shows
5. Result replaces or displays alongside original
6. User can download polished/translated version

## Cost Estimation

### OpenAI Costs (gpt-4o-mini)
- Input: ~$0.15 per 1M tokens
- Output: ~$0.60 per 1M tokens
- Average transcript (5,000 chars): ~1,250 tokens
- Cost per operation: ~$0.001-0.002

### Pricing Strategy
- Charge 1 credit per operation
- Credits cost: $0.07-0.15 per credit (based on plan)
- Healthy margin for AI costs

## Testing Strategy

1. **Unit Tests**: Prompt generation, timestamp preservation
2. **Integration Tests**: API endpoints with mock OpenAI
3. **E2E Tests**: Full user flow with real API (test account)
4. **Load Tests**: Rate limiting, concurrent requests

## Deployment Checklist

- [ ] Add OpenAI API key to environment variables
- [ ] Implement rate limiting middleware
- [ ] Add input validation
- [ ] Create API endpoints
- [ ] Update frontend components
- [ ] Add error handling and retry logic
- [ ] Set up monitoring (OpenAI usage, errors)
- [ ] Test with various transcript lengths
- [ ] Test timestamp preservation
- [ ] Test credit deduction
- [ ] Document API for frontend team

## Future Enhancements

1. **Batch Processing**: Process multiple transcripts
2. **Custom Prompts**: Let users specify polish style
3. **Language Detection**: Auto-detect source language
4. **Multi-language**: Translate to multiple languages at once
5. **Voice Preservation**: Maintain speaker identification in translation
6. **Quality Scores**: Show improvement metrics after polish
