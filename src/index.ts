import { MySQLDataSource } from "./core/mysql-connection"
import { bulkQuestion } from "./core/mongo-connection";
import { Questions } from "./entity/Questions"

const BATCH_SIZE = parseInt(process.env.BATCH_SIZE ?? '1000');

const questionRepository = MySQLDataSource.getRepository(Questions);

const worker = async (index: number) => {
    await questionRepository.find({
        take: BATCH_SIZE,
        skip: index * BATCH_SIZE
    })
    .then(async (questions) => {
        await bulkQuestion(questions);
    })
}

const loadData = async () => {
    // let start = performance.now();
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

            // const executePromise = async (i) => {
            //     await worker(i);
            //     console.log("Imported " + i);
            // };

            // console.time("Execution Time");
            // const promiseAll = Array.from({ length: Math.ceil(dataLength / 4000) }, (_, i) => executePromise(i));

            // Promise.all(promiseAll)
            // .then(() => {
            //     console.timeEnd("Execution Time");
            //     const now = performance.now();
            //     console.log(`DONE w/ ${now - start} (ms) estimated for ${dataLength} ${dataLength === 1 ? 'record' : 'records'}`);
            //     process.exit();
            // })
            // .catch((err) => {
            //     console.log(err);
            //     process.exit(1);
            // });
        } catch(err) {
            console.log(err);
        }
    })
}

loadData();

