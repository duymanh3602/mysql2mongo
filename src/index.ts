import { MySQLDataSource } from "./core/mysql-connection"
import { bulkQuestion } from "./core/mongo-connection";
import { Questions } from "./entity/Questions"
import { IsNull } from "typeorm";

const BATCH_SIZE = parseInt(process.env.BATCH_SIZE ?? '1000');

const questionRepository = MySQLDataSource.getRepository(Questions);

let stopFlag = false;
let bulkFlag = false;
let updateFlag = false;

const myCallback = () => {
    console.log('Done!');
    process.exit();
}
  

const update = async (questions: Questions[]) => {
    questions.forEach(async (question) => {
        // if ( question.IsUpdate === true ) return;
        // else {
            const data = {
                ...question,
                IsUpdate: true
            }
            await questionRepository.save(data);
        // }
    });
}

const worker = async (index: number) => {
    bulkFlag = false;
    updateFlag = false;
    const questions = await questionRepository.find({
        where: { IsUpdate: IsNull() },
        take: BATCH_SIZE,
        skip: index * BATCH_SIZE
    });

    await bulkQuestion(questions).then(() => {
        bulkFlag = true;
    });
    await update(questions).then(() => {
        updateFlag = true;
    });
}

const loadData = async () => {
    console.log('Press "q" to stop ...');
    
    await MySQLDataSource.initialize().then(async () => {
        try {
            const dataLength = await questionRepository.count({ where: { IsUpdate: IsNull() } });
            console.log(`Ready to import ${dataLength} ${dataLength === 1 ? 'record' : 'records'}`);
            
            if (dataLength < 1) {
                console.log("Empty target table");
                process.exit();
            }

            let promiseAll = [];
            for (let i = 0; i <= dataLength / BATCH_SIZE; i++) {
                if (stopFlag) break;
                promiseAll.push(await worker(i)
                    .then(() => {
                        console.log("Loaded " + i);
                    })
                )
            }
            
            Promise.all(promiseAll)
                .then(() => {
                    !stopFlag && console.log(`Imported ${dataLength} ${dataLength === 1 ? 'record' : 'records'}`);
                    if (bulkFlag && updateFlag) {
                        console.log('Waiting for 10 seconds to exit ...');
                        
                        const delay = 60000;
                        // Wait for 60 seconds to complete all await processes before exit the program 
                        setTimeout(myCallback, delay);
                    }
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

const receiveButtonPress = () => {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', (data) => {
        const input = data.toString().trim();
        if (input === 'Q' || input === 'q') {
            stopFlag = true;
            console.log('Button press received. Stopping all await processes...');
        }
    });
}

receiveButtonPress();
loadData();

