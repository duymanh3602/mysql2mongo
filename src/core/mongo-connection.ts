import { UUID } from "bson";
import { Schema, model, connect, Date } from "mongoose";
import { Questions } from "../entity/Questions";

const CONNECT_STRING = process.env.MONGO_CONNECT_STRING ?? "";
const COLLECTION_NAME = process.env.MONGO_COLLECTION_NAME ?? "questions";
const DATABASE_NAME = process.env.MONGO_DATABASE_NAME ?? "hoclieu";
// 1. Create an interface representing a document in MongoDB.
interface IQuestion {
  QuestionId: UUID;
  DataHash: string;
  Content: any;
  Remember: any;
  Solve: any;
  CorrectAnswer: any[];
  CreatedDate: Date;
  CreatedBy?: UUID;
  ModifiedDate: Date;
  ModifiedBy?: UUID;
}

// 2. Create a Schema corresponding to the document interface.
const questionSchema = new Schema<IQuestion>(
  {
    QuestionId: { type: UUID, required: false },
    DataHash: { type: String, required: false },
    Content: { type: Object, required: false },
    Remember: { type: Object, required: false },
    Solve: { type: Object, required: false },
    CorrectAnswer: { type: [], required: false },
    CreatedDate: { type: Date, required: false },
    CreatedBy: { type: String, required: false },
    ModifiedDate: { type: Date, required: false },
    ModifiedBy: { type: String, required: false },
  },
  { versionKey: false, collection: COLLECTION_NAME }
);

// 3. Create a Model.
export const Question = model<IQuestion>("", questionSchema);

const options = {
  connectTimeoutMS: 100000,
  socketTimeoutMS: 100000,
  dbName: DATABASE_NAME,
};

export async function bulkQuestion(questions: Questions[]) {
  // 4. Connect to MongoDB
  try {
    await connect(CONNECT_STRING, options);

    let promises = [];
    questions.map(async (q) => {
      // if (!q.IsUpdate) {
      // find question by id
      // let ques = await Question.findOne({ Question, DataHash: q.DataHash }).exec();

      const question = new Question({
        ...q,
        IsUpdate: true,
        CorrectAnswer: deserializeListDynamic(q.CorrectAnswer),
        Content: JSON.parse(q.Content),
        Remember: JSON.parse(q.Remember),
        Solve: JSON.parse(q.Solve),
        QuestionId: q.Id,
      });
      promises.push(question.save());
      // }
    });
    await Promise.all(promises);
  } catch (err) {
    console.log(err);
  }
}

// c# code convert to typescript
// private static List<dynamic> DeserializeListDynamic(string v)
// {
//     v = "{\"Result\":" + v + "}";
//     dynamic obj = JsonConvert.DeserializeObject<ExpandoObject>(v, new ExpandoObjectConverter());
//     return obj.Result;
// }

// private static dynamic DeserializeDynamic(string v)
// {
//     v = "{\"Result\":" + v + "}";
//     dynamic obj = JsonConvert.DeserializeObject<ExpandoObject>(v, new ExpandoObjectConverter());
//     return obj.Result;
// }

const deserializeListDynamic = (v: string) => {
  v = '{"Result":' + v + "}";
  let obj = JSON.parse(v);
  return obj.Result;
};
