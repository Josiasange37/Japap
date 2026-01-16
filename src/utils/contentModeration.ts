export interface ContentFilter {
  id: string;
  type: 'banned_word' | 'spam_pattern' | 'toxic_content' | 'inappropriate_media';
  pattern: string | RegExp;
  severity: 'low' | 'medium' | 'high';
  action: 'flag' | 'hide' | 'block';
}

export interface ModerationResult {
  isBlocked: boolean;
  isFlagged: boolean;
  reasons: string[];
  confidence: number;
}

export class ContentModerator {
  private static instance: ContentModerator;
  private filters: ContentFilter[] = [];

  private constructor() {
    this.initializeFilters();
  }

  static getInstance(): ContentModerator {
    if (!ContentModerator.instance) {
      ContentModerator.instance = new ContentModerator();
    }
    return ContentModerator.instance;
  }

  private initializeFilters() {
    this.filters = [
      // Banned words and hate speech
      {
        id: 'hate_speech_1',
        type: 'banned_word',
        pattern: /\b(hate|kill|murder|terror|violence)\b/gi,
        severity: 'high',
        action: 'block'
      },
      {
        id: 'spam_pattern_1',
        type: 'spam_pattern',
        pattern: /(.)\1{4,}/, // Repeated characters (aaaaa)
        severity: 'medium',
        action: 'flag'
      },
      {
        id: 'inappropriate_content_1',
        type: 'toxic_content',
        pattern: /\b(nude|naked|porn|xxx|adult)\b/gi,
        severity: 'high',
        action: 'block'
      },
      {
        id: 'harassment_1',
        type: 'toxic_content',
        pattern: /\b(stupid|idiot|retard|dumbass|loser)\b/gi,
        severity: 'medium',
        action: 'flag'
      },
      {
        id: 'spam_2',
        type: 'spam_pattern',
        pattern: /(http[s]?:\/\/\S+\s*){3,}/, // 3+ URLs
        severity: 'medium',
        action: 'flag'
      }
    ];
  }

  public moderateText(content: string): ModerationResult {
    const result: ModerationResult = {
      isBlocked: false,
      isFlagged: false,
      reasons: [],
      confidence: 0
    };

    let totalMatches = 0;

    this.filters.forEach(filter => {
      const matches = this.checkFilter(content, filter);
      if (matches > 0) {
        totalMatches += matches;
        
        if (filter.action === 'block') {
          result.isBlocked = true;
          result.reasons.push(`Blocked: ${filter.type} detected`);
        } else if (filter.action === 'flag') {
          result.isFlagged = true;
          result.reasons.push(`Flagged: ${filter.type} detected`);
        }

        // Add severity weight
        const severityWeight = filter.severity === 'high' ? 3 : filter.severity === 'medium' ? 2 : 1;
        result.confidence = Math.max(result.confidence, severityWeight);
      }
    });

    // Normalize confidence to 0-100
    result.confidence = Math.min(100, result.confidence * 20);

    return result;
  }

  public moderateMedia(file: File): Promise<ModerationResult> {
    return new Promise((resolve) => {
      // Basic file type and size checks
      const maxSize = 25 * 1024 * 1024; // 25MB
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm', 'audio/mp3', 'audio/wav'];
      
      const result: ModerationResult = {
        isBlocked: false,
        isFlagged: false,
        reasons: [],
        confidence: 0
      };

      if (!allowedTypes.includes(file.type)) {
        result.isBlocked = true;
        result.reasons.push('Blocked: Unsupported file type');
        resolve(result);
        return;
      }

      if (file.size > maxSize) {
        result.isBlocked = true;
        result.reasons.push('Blocked: File too large');
        resolve(result);
        return;
      }

      // For images, we could implement image analysis here
      if (file.type.startsWith('image/')) {
        this.analyzeImage(file).then(imageResult => {
          resolve(imageResult);
        });
      } else {
        resolve(result);
      }
    });
  }

  private checkFilter(content: string, filter: ContentFilter): number {
    let matches = 0;
    
    if (filter.pattern instanceof RegExp) {
      const regexMatches = content.match(filter.pattern);
      matches = regexMatches ? regexMatches.length : 0;
    } else {
      // Exact string match
      const parts = content.toLowerCase().split(filter.pattern.toLowerCase());
      matches = parts.length - 1;
    }

    return matches;
  }

  private async analyzeImage(file: File): Promise<ModerationResult> {
    // Placeholder for image analysis
    // In a real implementation, you would:
    // 1. Use a service like AWS Rekognition, Google Vision AI, or similar
    // 2. Check for adult content, violence, etc.
    // 3. Return results based on confidence scores
    
    const result: ModerationResult = {
      isBlocked: false,
      isFlagged: false,
      reasons: [],
      confidence: 0
    };

    // Basic filename analysis
    const suspiciousNames = ['nude', 'porn', 'xxx', 'adult', 'sex'];
    const filename = file.name.toLowerCase();
    
    for (const suspicious of suspiciousNames) {
      if (filename.includes(suspicious)) {
        result.isFlagged = true;
        result.reasons.push('Flagged: Suspicious filename');
        result.confidence = 60;
        break;
      }
    }

    return result;
  }

  public addCustomFilter(filter: ContentFilter) {
    this.filters.push(filter);
  }

  public removeFilter(filterId: string) {
    this.filters = this.filters.filter(f => f.id !== filterId);
  }

  public getFilters(): ContentFilter[] {
    return [...this.filters];
  }
}

export const contentModerator = ContentModerator.getInstance();