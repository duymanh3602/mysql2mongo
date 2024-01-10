import { UUID } from 'bson';
import { Schema, model, connect, Date } from 'mongoose';
import { Questions } from '../entity/Questions';

const CONNECT_STRING = process.env.MONGO_CONNECT_STRING ?? '';

// 1. Create an interface representing a document in MongoDB.
interface IQuestion {
    QuestionId: UUID
    DataHash: string
    Content: string
    Remember: string
    Solve: string
    CorrectAnswer: string
    IsUpdate?: boolean
    CreatedDate: Date
    CreatedBy?: UUID
    ModifiedDate: Date
    ModifiedBy?: UUID
}

// 2. Create a Schema corresponding to the document interface.
const questionSchema = new Schema<IQuestion>({
    QuestionId: { type: String, required: true },
    DataHash: { type: String, required: true },
    Content: { type: String, required: true },
    Remember: { type: String, required: true },
    Solve: { type: String, required: true },
    CorrectAnswer: { type: String, required: true },
    IsUpdate: { type: Boolean, required: false },
    CreatedDate: { type: String, required: true },
    CreatedBy: { type: String, required: false },
    ModifiedDate: { type: String, required: true },
    ModifiedBy: { type: String, required: false },
}, { versionKey: false });

// 3. Create a Model.
export const Question = model<IQuestion>('questions', questionSchema);

export async function bulkQuestion(questions: Questions) {
  // 4. Connect to MongoDB
  try {
    await connect(CONNECT_STRING);

    const question = new Question({
      ...questions,
      QuestionId: questions.id,
    });

    await question.save();
  } catch (err) {
    console.log(err);
  }
}