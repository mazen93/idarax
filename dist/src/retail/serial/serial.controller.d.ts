import { SerialService } from './serial.service';
import { RegisterSerialDto, UpdateSerialStatusDto } from './dto/serial.dto';
export declare class SerialController {
    private readonly serialService;
    constructor(serialService: SerialService);
    register(dto: RegisterSerialDto): Promise<any>;
    findBySerial(serial: string): Promise<any>;
    updateStatus(id: string, dto: UpdateSerialStatusDto): Promise<any>;
    findByProduct(productId: string): Promise<any>;
}
