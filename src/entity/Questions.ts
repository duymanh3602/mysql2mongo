import { Entity, Column, PrimaryColumn, Table } from "typeorm"

const TB_NAME = process.env.MYSQL_TABLE_NAME ?? 'questions';
// Đổi tên bảng tùy tên viết hoa hay viết thường
@Entity({name: TB_NAME})
export class Questions {

    @PrimaryColumn('char', {length: 36})
    Id: string

    @Column()
    DataHash: string

    @Column('longtext')
    Content: string

    @Column('longtext')
    Remember: string

    @Column('longtext')
    Solve: string

    @Column('longtext')
    CorrectAnswer: string

    @Column('tinyint', {nullable: true})
    IsUpdate?: boolean

    @Column('datetime')
    CreatedDate: Date

    @Column('char', {length: 36})
    CreatedBy: string

    @Column('datetime')
    ModifiedDate: Date

    @Column('char', {length: 36})
    ModifiedBy: string
}
