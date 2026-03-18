import { TableService } from './table.service';
import { CreateTableDto, UpdateTableDto } from './dto/table.dto';
export declare class TableController {
    private readonly tableService;
    constructor(tableService: TableService);
    create(dto: CreateTableDto): Promise<any>;
    findAll(): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, dto: UpdateTableDto): Promise<any>;
    moveOrder(id: string, targetTableId: string): Promise<any>;
    merge(id: string, targetTableId: string): Promise<any>;
    unmerge(id: string): Promise<any>;
    checkout(id: string): Promise<{
        message: string;
        orders: any;
    }>;
    remove(id: string): Promise<any>;
}
