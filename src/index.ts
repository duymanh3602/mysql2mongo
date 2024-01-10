import { MySQLDataSource } from "./core/mysql-connection"
import { Questions } from "./entity/Questions"
import { bulkQuestion } from "./core/mongo-connection";
import { kill } from "process";

const questionRepository = MySQLDataSource.getRepository(Questions);

const worker = async (index: number) => {
    const questions = await questionRepository.find({
        take: 1000,
        skip: index
    })
    questions.forEach((question) => {
        bulkQuestion(question);
    });
}

const loadData = async () => {
    let start = performance.now();
    MySQLDataSource.initialize().then( async () => {
        try {       
            const dataLength = await questionRepository.count();
            if (dataLength < 1) {
                console.log("Empty target table");
                process.exit();

            }            
            let promiseAll = [];
            for (var i = 0; i <= dataLength / 1000; i++) {                
                promiseAll.push(worker(i))
            }            
            Promise.all(promiseAll).then(() => {
                const now = performance.now();
                console.log(`DONE w/ ${now - start} (ms) estimated for ${dataLength} ${dataLength === 1 ? 'record' : 'records'}`);
                process.exit();
            }).catch((err) => {
                console.log(err);
            });            
        } catch(err) {
            console.log(err);
        }
    })
}

loadData();

