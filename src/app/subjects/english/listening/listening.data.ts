// 听力练习（短文/对话 + 理解题）。音频由浏览器 TTS 合成，无需音频文件。
export interface ListeningQuestion { q: string; options: string[]; answer: number }
export interface ListeningExercise {
  level: '初中' | '高中';
  title: string;
  transcript: string;
  questions: ListeningQuestion[];
}

export const LISTENING_EXERCISES: ListeningExercise[] = [
  {
    level: '初中', title: 'A Phone Call',
    transcript: 'Hello, this is Lucy. I\'m calling to tell you that the meeting tomorrow has been moved from nine to ten in the morning. Please bring your report and come to Room 305. If you have any questions, call me back. Thank you.',
    questions: [
      { q: 'What time is the meeting now?', options: ['9 a.m.', '10 a.m.', '3 p.m.', '5 p.m.'], answer: 1 },
      { q: 'What should you bring?', options: ['A book', 'A report', 'A laptop', 'Nothing'], answer: 1 },
      { q: 'Which room is the meeting in?', options: ['Room 035', 'Room 503', 'Room 305', 'Room 350'], answer: 2 },
    ],
  },
  {
    level: '初中', title: 'At the Restaurant',
    transcript: 'Waiter: Good evening. Are you ready to order? Customer: Yes. I\'d like a chicken sandwich and a glass of orange juice. Waiter: Would you like anything else? Customer: No, thank you. How much is it? Waiter: That\'s eight dollars in total.',
    questions: [
      { q: 'What does the customer order to drink?', options: ['Coffee', 'Tea', 'Orange juice', 'Water'], answer: 2 },
      { q: 'How much is the meal?', options: ['$6', '$8', '$10', '$18'], answer: 1 },
    ],
  },
  {
    level: '初中', title: 'Weekend Plan',
    transcript: 'Tom: What are you going to do this weekend, Mary? Mary: I\'m going to visit my grandparents in the countryside on Saturday. On Sunday I\'ll stay at home and finish my science project. What about you? Tom: I\'m going hiking with my father if the weather is fine.',
    questions: [
      { q: 'Where will Mary go on Saturday?', options: ['To school', 'To the countryside', 'To the cinema', 'To the park'], answer: 1 },
      { q: 'What will Tom do if the weather is fine?', options: ['Go hiking', 'Stay home', 'Visit Mary', 'Do homework'], answer: 0 },
    ],
  },
  {
    level: '高中', title: 'A Campus Announcement',
    transcript: 'Attention, please. The library will close early today at five p.m. because of a staff meeting. Students who need to return books may use the drop box near the main entrance. The library will reopen tomorrow at the usual time, eight in the morning. We apologize for any inconvenience.',
    questions: [
      { q: 'Why will the library close early?', options: ['A holiday', 'A staff meeting', 'A power cut', 'Bad weather'], answer: 1 },
      { q: 'How can students return books after closing?', options: ['Email the staff', 'Use the drop box', 'Wait till tomorrow', 'Call the office'], answer: 1 },
      { q: 'When will the library reopen?', options: ['5 p.m.', '6 a.m.', '8 a.m.', '9 a.m.'], answer: 2 },
    ],
  },
  {
    level: '高中', title: 'An Interview',
    transcript: 'Interviewer: Could you tell me why you want this job? Applicant: Of course. I\'ve always been interested in environmental protection, and your company is a leader in clean energy. I believe my background in chemistry would let me contribute to your research team. Interviewer: That sounds great. When could you start? Applicant: I could start at the beginning of next month.',
    questions: [
      { q: 'What field is the company a leader in?', options: ['Education', 'Clean energy', 'Banking', 'Tourism'], answer: 1 },
      { q: 'What is the applicant\'s background?', options: ['Physics', 'Biology', 'Chemistry', 'History'], answer: 2 },
      { q: 'When can the applicant start?', options: ['Tomorrow', 'Next week', 'Beginning of next month', 'Next year'], answer: 2 },
    ],
  },
  {
    level: '高中', title: 'A Weather Report',
    transcript: 'Good morning. Here is today\'s weather. It will be cloudy in the morning with a light wind. In the afternoon, there is a good chance of heavy rain, so remember to take an umbrella when you go out. The temperature will range from twelve to nineteen degrees. The rain will stop by evening.',
    questions: [
      { q: 'What will the weather be like in the afternoon?', options: ['Sunny', 'Snowy', 'Heavy rain', 'Foggy'], answer: 2 },
      { q: 'What is the highest temperature today?', options: ['12°', '15°', '19°', '21°'], answer: 2 },
      { q: 'When will the rain stop?', options: ['By noon', 'By evening', 'At night', 'Tomorrow'], answer: 1 },
    ],
  },
];
