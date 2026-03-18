import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { VendorService } from './vendor.service';
import { CreateVendorDto, UpdateVendorDto } from './dto/vendor.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Permissions } from '../../auth/permissions.decorator';
import { Actions } from '../../auth/permissions.constants';

@Controller('retail/vendors')
@UseGuards(JwtAuthGuard)
export class VendorController {
    constructor(private readonly vendorService: VendorService) { }

    @Post()
    @Permissions(Actions.CATALOG.CREATE)
    create(@Body() dto: CreateVendorDto) {
        return this.vendorService.create(dto);
    }

    @Get()
    @Permissions(Actions.CATALOG.VIEW)
    findAll() {
        return this.vendorService.findAll();
    }

    @Patch(':id')
    @Permissions(Actions.CATALOG.EDIT)
    update(@Param('id') id: string, @Body() dto: UpdateVendorDto) {
        return this.vendorService.update(id, dto);
    }

    @Delete(':id')
    @Permissions(Actions.CATALOG.DELETE)
    remove(@Param('id') id: string) {
        return this.vendorService.remove(id);
    }

    @Post(':id/products')
    @Permissions(Actions.CATALOG.EDIT)
    linkProduct(@Param('id') id: string, @Body() dto: any) {
        return this.vendorService.linkProduct(id, dto);
    }

    @Delete(':id/products/:productId')
    @Permissions(Actions.CATALOG.EDIT)
    unlinkProduct(@Param('id') id: string, @Param('productId') productId: string) {
        return this.vendorService.unlinkProduct(id, productId);
    }

    @Get(':id/products')
    @Permissions(Actions.CATALOG.VIEW)
    getProducts(@Param('id') id: string) {
        return this.vendorService.getProducts(id);
    }
}
