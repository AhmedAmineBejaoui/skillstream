import PDFDocument from 'pdfkit';
import { v4 as uuidv4 } from 'uuid';

interface Question {
  id: string;
  question: string;
  options: string[];
  answer: number;
}

interface Quiz {
  id: number;
  title: string;
  questions: Question[];
}

interface Certificate {
  id: string;
  user: string;
  course: string;
  pdf: Buffer;
}

const quizzes: Quiz[] = [
  {
    id: 1,
    title: 'Sample Quiz',
    questions: [
      { id: 'q1', question: '2 + 2 = ?', options: ['3', '4', '5'], answer: 1 },
      { id: 'q2', question: 'Capital of France?', options: ['London', 'Berlin', 'Paris'], answer: 2 }
    ]
  }
];

const certificates: Certificate[] = [];

function createCertificate(user: string, course: string): Promise<Certificate> {
  return new Promise(resolve => {
    const doc = new PDFDocument();
    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdf = Buffer.concat(buffers);
      resolve({ id: uuidv4(), user, course, pdf });
    });

    doc.fontSize(24).text('Certificate of Completion', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text(`${user} has completed ${course}`, { align: 'center' });
    doc.end();
  });
}

export const assessmentService = {
  getQuiz(id: number) {
    return quizzes.find(q => q.id === id);
  },
  async submitQuiz(id: number, answers: Record<string, number>, user: string) {
    const quiz = quizzes.find(q => q.id === id);
    if (!quiz) throw new Error('Quiz not found');
    let correct = 0;
    quiz.questions.forEach(q => {
      if (answers[q.id] === q.answer) correct++;
    });
    const score = (correct / quiz.questions.length) * 100;
    if (score >= 70) {
      const cert = await createCertificate(user, quiz.title);
      certificates.push(cert);
      return { passed: true, score, certificateId: cert.id, certificate: cert.pdf.toString('base64') };
    }
    return { passed: false, score };
  },
  verifyCertificate(id: string) {
    return certificates.some(c => c.id === id);
  }
};
