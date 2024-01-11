import { MySQLDataSource } from "./core/mysql-connection"
import { bulkQuestion } from "./core/mongo-connection";
import { Questions } from "./entity/Questions"


const questionRepository = MySQLDataSource.getRepository(Questions);

const worker = async (index: number) => {
    await questionRepository.find({
        take: 4000,
        skip: index
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

            /** C1 - 125s */
            /** V2 - 110s */
            let promiseAll = [];
            for (var i = 0; i <= dataLength / 4000; i++) {                
                promiseAll.push(await worker(i)
                    .then(() => {
                        console.log("Loaded " + i);
                        }
                    )
                )
            }
            Promise.all(promiseAll).then(() => {
                console.log(`Importing ${dataLength} ${dataLength === 1 ? 'record' : 'records'}`);
            }).catch((err) => {
                console.log(err);
            });

            /** C2 */
            // const batchSize = 10; // Số lượng `i` trong mỗi batch

            // const numBatches = Math.ceil((dataLength / 1000) / batchSize);
            // const batches = Array.from({ length: numBatches }, (_, batchIndex) => {
            //     const start = batchIndex * batchSize;
            //     const end = Math.min(start + batchSize, dataLength / 1000);

            //     return Array.from({ length: end - start }, (_, offset) => start + offset);
            // });

            // const promises = batches.flatMap((batch) =>
            //     batch.map(async (i) => {
            //         await worker(i);
            //         console.log("Imported " + i);
            //     })
            // );

            // Promise.all(promises)
            //     .then(() => {
            //         const now = performance.now();
            //         console.log(`DONE w/ ${now - start} (ms) estimated for ${dataLength} ${dataLength === 1 ? 'record' : 'records'}`);
            //     })
            // .catch((err) => {
            //     console.log(err);
            // });


            /** C3 - 120s */
            // let promiseAll = [];
            // const concurrencyLimit = 10; // Giới hạn số lượng promise được thực thi đồng thời
            // let runningPromises = 0; // Số lượng promise đang chạy

            // const executePromise = async (i) => {
            //     await worker(i);
            //     console.log("Imported " + i);
            // };

            // const executeNextPromise = async () => {
            //     if (promiseAll.length === 0) return; // Kiểm tra nếu không còn promise để thực thi

            //     const i = promiseAll.shift(); // Lấy promise đầu tiên trong mảng
            //     runningPromises++;

            //     try {
            //         await executePromise(i);
            //     } catch (err) {
            //         console.log(err);
            //     } finally {
            //         runningPromises--;

            //         // Nếu còn promise trong mảng và số lượng promise đang chạy chưa đạt giới hạn, tiếp tục thực thi promise tiếp theo
            //         if (promiseAll.length > 0 && runningPromises < concurrencyLimit) {
            //             executeNextPromise();
            //         } else if (promiseAll.length === 0 && runningPromises === 0) {
            //             // Nếu không còn promise và không có promise nào đang chạy, hoàn thành việc thực thi
            //             const now = performance.now();
            //             console.log(`DONE w/ ${now - start} (ms) estimated for ${dataLength} ${dataLength === 1 ? 'record' : 'records'}`);
            //         }
            //     }
            // };

            // for (let i = 0; i <= dataLength / 1000; i++) {
            //     promiseAll.push(i);
            // }

            // // Thực thi số lượng promise ban đầu
            // for (let i = 0; i < concurrencyLimit; i++) {
            //     executeNextPromise();
            // }
        } catch(err) {
            console.log(err);
        }
    })
}

loadData();

