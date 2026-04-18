// AiBI-L Workshop Content Types
// Pattern adapted from content/courses/aibi-s/types.ts
// AiBI-L is a 1-day in-person workshop, not a multi-week course
// AiBI-L uses Pillar A sage color system throughout

export type SessionNumber = 1 | 2 | 3 | 4;

export interface MaturityDimension {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly minScore: 1;
  readonly maxScore: 5;
}

export interface MaturityLevel {
  readonly label: string;
  readonly minScore: number;
  readonly maxScore: number;
  readonly implication: string;
}

export interface SourcedStatistic {
  readonly value: string;
  readonly source: string;
  readonly year: string;
}

export interface ExaminerQuestion {
  readonly category: string;
  readonly likelyQuestions: readonly string[];
  readonly whatYouNeedToShow: string;
}

export interface RoadmapPhase {
  readonly label: string;
  readonly timeline: string;
  readonly focus: string;
  readonly milestones: readonly string[];
}

export interface BoardDeckSection {
  readonly title: string;
  readonly sourceSession: SessionNumber;
  readonly content: string;
}

export interface FacilitatedActivity {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly estimatedMinutes: number;
  readonly deliverable: string;
  readonly facilitationNotes: string;
}

export interface ContentSection {
  readonly id: string;
  readonly title: string;
  readonly content: string;
  readonly subsections?: readonly ContentSection[];
}

export interface WorkshopSession {
  readonly number: SessionNumber;
  readonly title: string;
  readonly durationMinutes: number;
  readonly startTime: string;
  readonly coreQuestion: string;
  readonly purpose: string;
  readonly keyTakeaways?: readonly string[];
  readonly sections: readonly ContentSection[];
  readonly activity: FacilitatedActivity;
  readonly deliverable: string;
  readonly statistics?: readonly SourcedStatistic[];
}

export interface WorkshopDeliverable {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly producedInSession: SessionNumber;
  readonly format: string;
}

export interface WorkshopOverview {
  readonly id: 'aibi-l';
  readonly name: string;
  readonly fullName: string;
  readonly credentialDisplay: string;
  readonly tagline: string;
  readonly audience: string;
  readonly format: string;
  readonly duration: string;
  readonly priceIndividual: string;
  readonly priceTeam: string;
  readonly prerequisite: string;
  readonly accent: string;
  readonly sessions: readonly WorkshopSession[];
  readonly deliverables: readonly WorkshopDeliverable[];
  readonly maturityDimensions: readonly MaturityDimension[];
  readonly maturityLevels: readonly MaturityLevel[];
}
