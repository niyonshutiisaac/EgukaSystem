import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto, UpdateRecipeDto } from './dto/recipe.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PlanFeature } from '../common/decorators/plan-feature.decorator';

@ApiTags('recipes')
@PlanFeature('production')
@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipes: RecipesService) {}

  @Get()
  list(
    @CurrentUser('tenantId') tenantId: string,
    @Query('search') search?: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    return this.recipes.list(tenantId, {
      search,
      activeOnly: activeOnly === 'true',
    });
  }

  @Get(':id')
  getOne(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string) {
    return this.recipes.getById(tenantId, id);
  }

  @Post()
  create(@CurrentUser('tenantId') tenantId: string, @Body() dto: CreateRecipeDto) {
    return this.recipes.create(tenantId, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateRecipeDto,
  ) {
    return this.recipes.update(tenantId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string) {
    return this.recipes.remove(tenantId, id);
  }
}
