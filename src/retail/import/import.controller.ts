import { Controller, Post, UseInterceptors, UploadedFile, Query, BadRequestException, UseGuards, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ImportService } from './import.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Permissions } from '../../auth/permissions.decorator';
import { Actions } from '../../auth/permissions.constants';

@ApiTags('Import')
@Controller('import')
@UseGuards(JwtAuthGuard)
export class ImportController {
    constructor(private readonly importService: ImportService) { }

    @Post('products')
    @Permissions(Actions.CATALOG.CREATE)
    @ApiOperation({ summary: 'Import products from CSV/Excel' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
            },
        },
    })
    @UseInterceptors(FileInterceptor('file'))
    async importProducts(
        @UploadedFile() file: Express.Multer.File,
        @Query('mode') mode: 'OVERRIDE' | 'SKIP_EXISTING' = 'SKIP_EXISTING'
    ) {
        if (!file) throw new BadRequestException('File is required');
        return this.importService.importProducts(file, mode);
    }

    @Post('customers')
    @Permissions(Actions.CUSTOMERS.CREATE)
    @ApiOperation({ summary: 'Import customers from CSV/Excel' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
            },
        },
    })
    @UseInterceptors(FileInterceptor('file'))
    async importCustomers(
        @UploadedFile() file: Express.Multer.File,
        @Query('mode') mode: 'OVERRIDE' | 'SKIP_EXISTING' = 'SKIP_EXISTING'
    ) {
        if (!file) throw new BadRequestException('File is required');
        return this.importService.importCustomers(file, mode);
    }

    @Get('export/products')
    @Permissions(Actions.CATALOG.VIEW)
    @ApiOperation({ summary: 'Export products to CSV' })
    async exportProducts(@Res() res: Response) {
        const buffer = await this.importService.exportProducts();
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=products_export.csv');
        res.send(buffer);
    }
}
