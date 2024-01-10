import { randomUUID } from "crypto";
import { MySQLDataSource } from "../core/mysql-connection";
import { Questions } from "../entity/Questions";

const args = process.argv;
const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const questionRepository = MySQLDataSource.getRepository(Questions);

const generate = (length: number, upper?: boolean) => {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return upper ? result.toUpperCase() : result;
  
}

const generateQuestion = async () => {
    const question: Questions = {
        Id: randomUUID(),
        DataHash: generate('B1343224B3C3B73D6450D05C5D8D7102'.length, true),
        Content: generate(30),
        Remember: generate(30),
        Solve: generate(30),
        CorrectAnswer: generate(30),
        CreatedDate: new Date(),
        CreatedBy: randomUUID(),
        ModifiedDate: new Date(),
        ModifiedBy: randomUUID()
    }
    await questionRepository.save(question);
}

const worker = async (length?: number) => {
    const task = length ?? 100;
    let start = performance.now();
    MySQLDataSource.initialize().then(async() => {
        try {
            let promiseAll = [];
            for (let i = 0; i < task; i++) {
                promiseAll.push(generateQuestion());
            }
            Promise.all(promiseAll).then(() => {
                const now = performance.now();
                console.log(`Created w/ ${now - start} (ms) estimated for ${task} ${task === 1 ? 'record' : 'records'}`);
                process.exit();
            }).catch((err) => {
                console.log(err);
            });
        } catch (err) {
            console.log(err); 
        }
    })
}

worker(parseInt(args[3] ?? '100'));

