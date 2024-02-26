import { MySQLDataSource } from "./core/mysql-connection";
import { bulkQuestion } from "./core/mongo-connection";
import { Questions } from "./entity/Questions";
import { Between } from "typeorm";

const BATCH_SIZE = parseInt(process.env.BATCH_SIZE ?? "1000");
const DATE_FILTER = process.env.DATE_START ?? undefined;
var fs = require("fs");

const questionRepository = MySQLDataSource.getRepository(Questions);

const loadData = async () => {
  console.log("Loading data...");
  console.log('Press "q" to stop ...');
  await MySQLDataSource.initialize().then(async () => {
    let timeFilter = new Date();
    try {
      if (DATE_FILTER) {
        timeFilter = new Date(DATE_FILTER);
      } else {
        let questionOldest = await questionRepository.findOne({
          order: { CreatedDate: "ASC" },
          select: ["CreatedDate"],
          where: {},
        });
        timeFilter = new Date(questionOldest?.CreatedDate ?? new Date());
      }
      // dateLowerLimitFilter format yyyy-mm-dd 00:00:00
      let dateLowerLimitFilter = new Date(timeFilter.getTime());
      dateLowerLimitFilter.setHours(0, 0, 0, 0);
      // dateUpperLimitFilter format yyyy-mm-dd 23:59:59
      let dateUpperLimitFilter = new Date(timeFilter.getTime());
      dateUpperLimitFilter.setHours(23, 59, 59, 999);
      console.log(
        "Start update from " +
          dateLowerLimitFilter.toLocaleDateString() +
          " " +
          dateLowerLimitFilter.toLocaleTimeString() +
          " to " +
          dateUpperLimitFilter.toLocaleDateString() +
          " " +
          dateUpperLimitFilter.toLocaleTimeString()
      );

      let flag = true;
      while (flag) {
        // update IsUpdate = null fon dateFilter
        let questions = await questionRepository.count({
          where: {
            CreatedDate: Between(dateLowerLimitFilter, dateUpperLimitFilter),
          },
        });

        if (questions > 0) {
          for (let i = 0; i < questions; i += BATCH_SIZE) {
            let questions = await questionRepository.find({
              where: {
                CreatedDate: Between(
                  dateLowerLimitFilter,
                  dateUpperLimitFilter
                ),
              },
              take: BATCH_SIZE,
              skip: i,
            });

            await bulkQuestion(questions).then(() => {});
          }
          console.log(
            "Update done " +
              questions +
              " records in " +
              "s. Date" +
              dateLowerLimitFilter.toLocaleDateString()
          );
          // write log in file output.txt
          fs.appendFileSync(
            "src/output.txt",
            "Update done " +
              questions +
              " records in " +
              "s. Date" +
              dateLowerLimitFilter.toLocaleDateString() +
              "\n"
          );
        }

        // increment dateLowerLimitFilter
        dateLowerLimitFilter.setDate(dateLowerLimitFilter.getDate() + 1);
        dateUpperLimitFilter.setDate(dateUpperLimitFilter.getDate() + 1);
        continue;
      }
    } catch (err) {
      console.log(err);
    }
  });
};

const receiveButtonPress = () => {
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on("data", (data) => {
    const input = data.toString().trim();
    if (input === "Q" || input === "q") {
      console.log("Button press received. Stopping all await processes...");
      process.exit();
    }
  });
};

receiveButtonPress();
loadData();
