import "reflect-metadata"
import { DataSource } from "typeorm"
import { Questions } from "../entity/Questions"
import 'dotenv/config'

export const MYSQL = {
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
}

export const MySQLDataSource = new DataSource({
    type: "mysql",
    host: MYSQL.host,
    port: MYSQL.port,
    username: MYSQL.user,
    password: MYSQL.password,
    database: MYSQL.database,
    synchronize: true,
    logging: false,
    entities: [Questions],
    migrations: [],
    subscribers: [],
})


