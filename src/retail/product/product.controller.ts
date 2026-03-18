import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Put } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { UpsertBranchProductDto } from './dto/branch-product.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Permissions } from '../../auth/permissions.decorator';
import { Actions } from '../../auth/permissions.constants';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Retail Products')
@ApiBearerAuth()
@Controller('retail/products')
@UseGuards(JwtAuthGuard)
export class ProductController {
    constructor(private readonly productService: ProductService) { }

    @Post()
    @Permissions(Actions.CATALOG.CREATE)
    create(@Body() dto: CreateProductDto) {
        return this.productService.create(dto);
    }

    @Get()
    @Permissions(Actions.CATALOG.VIEW)
    @ApiQuery({ name: 'branchId', required: false, description: 'Filter products by branch availability' })
    findAll(@Query('branchId') branchId?: string) {
        return this.productService.findAll(branchId);
    }

    // ─── Named routes MUST come before :id wildcard ──────────────────────────

    @Get('barcode/:barcode')
    @Permissions(Actions.CATALOG.VIEW)
    findByBarcode(@Param('barcode') barcode: string) {
        return this.productService.findByBarcode(barcode);
    }

    @Get('branch/:branchId')
    @Permissions(Actions.CATALOG.VIEW)
    @ApiOperation({ summary: 'Get all products with branch availability/price overrides' })
    getBranchSettings(@Param('branchId') branchId: string) {
        return this.productService.getBranchSettings(branchId);
    }

    @Put('branch/:branchId/:productId')
    @Permissions(Actions.CATALOG.EDIT)
    @ApiOperation({ summary: 'Enable/disable a product for a branch, or set a price override' })
    upsertBranchSetting(
        @Param('branchId') branchId: string,
        @Param('productId') productId: string,
        @Body() dto: UpsertBranchProductDto,
    ) {
        return this.productService.upsertBranchSetting(branchId, productId, dto);
    }

    @Delete('branch/:branchId/:productId')
    @Permissions(Actions.CATALOG.EDIT)
    @ApiOperation({ summary: 'Reset a product to global defaults for a branch' })
    resetBranchSetting(
        @Param('branchId') branchId: string,
        @Param('productId') productId: string,
    ) {
        return this.productService.resetBranchSetting(branchId, productId);
    }

    // ─── Wildcard :id routes MUST come LAST ─────────────────────────────────

    @Get(':id')
    @Permissions(Actions.CATALOG.VIEW)
    findOne(@Param('id') id: string) {
        return this.productService.findOne(id);
    }

    @Patch(':id')
    @Permissions(Actions.CATALOG.EDIT)
    update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
        return this.productService.update(id, dto);
    }

    @Delete(':id')
    @Permissions(Actions.CATALOG.DELETE)
    remove(@Param('id') id: string) {
        return this.productService.remove(id);
    }
}
