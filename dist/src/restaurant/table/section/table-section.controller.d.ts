import { TableSectionService } from './table-section.service';
import { CreateTableSectionDto, UpdateTableSectionDto } from './dto/table-section.dto';
export declare class TableSectionController {
    private readonly sectionService;
    constructor(sectionService: TableSectionService);
    create(dto: CreateTableSectionDto): Promise<any>;
    findAll(): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, dto: UpdateTableSectionDto): Promise<any>;
    remove(id: string): Promise<any>;
}
