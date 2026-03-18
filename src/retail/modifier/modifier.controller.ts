import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ModifierService } from './modifier.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Permissions } from '../../auth/permissions.decorator';
import { Actions } from '../../auth/permissions.constants';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Product Modifiers')
@ApiBearerAuth()
@Controller('retail/products/:productId/modifiers')
@UseGuards(JwtAuthGuard)
export class ModifierController {
    constructor(private readonly modifierService: ModifierService) { }

    @Get()
    @Permissions(Actions.CATALOG.VIEW)
    @ApiOperation({ summary: 'Get all modifier groups + options for a product' })
    getAll(@Param('productId') productId: string) {
        return this.modifierService.getForProduct(productId);
    }

    @Post('groups')
    @Permissions(Actions.CATALOG.EDIT)
    @ApiOperation({ summary: 'Create a modifier group (e.g. "Sauce", "Size")' })
    createGroup(
        @Param('productId') productId: string,
        @Body() dto: { name: string; required?: boolean; multiSelect?: boolean; sortOrder?: number },
    ) {
        return this.modifierService.createGroup(productId, dto);
    }

    @Patch('groups/:groupId')
    @Permissions(Actions.CATALOG.EDIT)
    @ApiOperation({ summary: 'Update a modifier group' })
    updateGroup(
        @Param('groupId') groupId: string,
        @Body() dto: { name?: string; required?: boolean; multiSelect?: boolean; sortOrder?: number },
    ) {
        return this.modifierService.updateGroup(groupId, dto);
    }

    @Delete('groups/:groupId')
    @Permissions(Actions.CATALOG.DELETE)
    @ApiOperation({ summary: 'Delete a modifier group and all its options' })
    deleteGroup(@Param('groupId') groupId: string) {
        return this.modifierService.deleteGroup(groupId);
    }

    @Post('groups/:groupId/options')
    @Permissions(Actions.CATALOG.EDIT)
    @ApiOperation({ summary: 'Add an option to a modifier group' })
    addOption(
        @Param('groupId') groupId: string,
        @Body() dto: { name: string; priceAdjust?: number; sortOrder?: number },
    ) {
        return this.modifierService.addOption(groupId, dto);
    }

    @Patch('groups/:groupId/options/:optionId')
    @Permissions(Actions.CATALOG.EDIT)
    @ApiOperation({ summary: 'Update an option' })
    updateOption(
        @Param('optionId') optionId: string,
        @Body() dto: { name?: string; priceAdjust?: number; sortOrder?: number },
    ) {
        return this.modifierService.updateOption(optionId, dto);
    }

    @Delete('groups/:groupId/options/:optionId')
    @Permissions(Actions.CATALOG.DELETE)
    @ApiOperation({ summary: 'Delete an option' })
    deleteOption(@Param('optionId') optionId: string) {
        return this.modifierService.deleteOption(optionId);
    }
}
