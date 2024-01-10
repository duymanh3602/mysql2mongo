import { Entity, Column, PrimaryColumn } from "typeorm"

@Entity({name: 'questions'})
export class Questions {

    @PrimaryColumn('char', {length: 36})
    id: string

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
