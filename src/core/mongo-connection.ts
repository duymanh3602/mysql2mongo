import { UUID } from 'bson';
import { Schema, model, connect, Date } from 'mongoose';
import { Questions } from '../entity/Questions';

const CONNECT_STRING = process.env.MONGO_CONNECT_STRING ?? '';
const COLLECTION_NAME = process.env.MONGO_COLLECTION_NAME ?? 'questions';

// 1. Create an interface representing a document in MongoDB.
interface IQuestion {
    QuestionId: UUID
    DataHash: string
    Content: string
    Remember: string
    Solve: string
    CorrectAnswer: string
    CreatedDate: Date
    CreatedBy?: UUID
    ModifiedDate: Date
    ModifiedBy?: UUID
}

// 2. Create a Schema corresponding to the document interface.
const questionSchema = new Schema<IQuestion>({
    QuestionId: { type: UUID, required: false },
    DataHash: { type: String, required: false },
    Content: { type: String, required: false },
    Remember: { type: String, required: false },
    Solve: { type: String, required: false },
    CorrectAnswer: { type: String, required: false },
    CreatedDate: { type: Date, required: false },
    CreatedBy: { type: String, required: false },
    ModifiedDate: { type: Date, required: false },
    ModifiedBy: { type: String, required: false },
}, { versionKey: false, collection: COLLECTION_NAME });

// 3. Create a Model.
export const Question = model<IQuestion>('', questionSchema);

const options = {
  connectTimeoutMS: 100000,
  socketTimeoutMS: 100000,
};

export async function bulkQuestion(questions: Questions[]) {
  // 4. Connect to MongoDB
  try {
    await connect(CONNECT_STRING, options);

    await Promise.all(
      questions.map(async (q) => {
        if (!q.IsUpdate) {
          const question = new Question({
            ...q,
            IsUpdate: true,
            QuestionId: q.Id,
          });
          await question.save();
        }
      })
    );
  } catch (err) {
    console.log(err);
  }
}