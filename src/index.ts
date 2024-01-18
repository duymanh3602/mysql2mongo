import { MySQLDataSource } from "./core/mysql-connection"
import { bulkQuestion } from "./core/mongo-connection";
import { Questions } from "./entity/Questions"

const BATCH_SIZE = parseInt(process.env.BATCH_SIZE ?? '1000');

const questionRepository = MySQLDataSource.getRepository(Questions);

const update = async (questions: Questions[]) => {
    questions.forEach(async (question) => {
        if ( question.IsUpdate === true ) return;
        else {
            const data = {
                ...question,
                IsUpdate: true
            }
            await questionRepository.save(data);
        }
        
    });
}

const worker = async (index: number) => {
    await questionRepository.find({
        where:{ IsUpdate: null },
        take: BATCH_SIZE,
        skip: index * BATCH_SIZE
    })
    .then(async (questions) => {
        await bulkQuestion(questions);
        await update(questions);
    })
}

const loadData = async () => {
    await MySQLDataSource.initialize().then( async () => {
        try {
            const dataLength = await questionRepository.count();
            if (dataLength < 1) {
                console.log("Empty target table");
                process.exit();
            }

            let promiseAll = [];
            for (var i = 0; i <= dataLength / BATCH_SIZE; i++) {                
                promiseAll.push(await worker(i)
                    .then(() => {
                        console.log("Loaded " + i);
                    })
                )
            }
            
            Promise.all(promiseAll)
                .then(() => {
                    console.log(`Imported ${dataLength} ${dataLength === 1 ? 'record' : 'records'}`);
                    process.exit();
                })
                .catch((err) => {
                    console.log(err);
                    process.exit(1);
            });
        } catch(err) {
            console.log(err);
        }
    })
}

loadData();

