import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Table } from '../../tables/entities/table.entity';

@Entity()
export class GameLog {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Table, table => table.id)
    table: Table;

    @Column()
    tableId: number;

    @CreateDateColumn()
    timestamp: Date;

    @Column()
    type: string;

    @Column()
    message: string;

    @Column({ type: 'json', nullable: true })
    data: any;
} 