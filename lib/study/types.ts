export type ExamQuestion = {
  question: string;
  answer: string;
};

export type StudyPack = {
  summary: string;
  questions: ExamQuestion[];
};
