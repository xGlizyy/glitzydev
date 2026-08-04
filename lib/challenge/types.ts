export type ChallengeQuestionType = "sinonimo" | "antonimo";

export type ChallengeQuestion = {
  word: string;
  type: ChallengeQuestionType;
  options: string[];
  correctIndex: number;
};

export type DailyChallenge = {
  date: string;
  questions: ChallengeQuestion[];
};
